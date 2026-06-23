import express from 'express'
import pool from '../db.js'
import authenticateToken from '../middleware/auth.js'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
dotenv.config()

const assistantRouter = express.Router()
const client = new Anthropic()

const tools = [
    {
        name: 'search_client',
        description: 'Searches for a client by name or similar match.',
        input_schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name or part of the client name.'
                }
            },
            required: ['name']
        }
    },
    {
        name: 'search_projects',
        description: 'Retrieves a list of all projects or searches for a specific project by name.',
        input_schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name or part of the project name. Optional.'
                },
                client_id: {
                    type: 'integer',
                    description: 'Filter projects belonging strictly to this client ID. Optional.'
                }
            },
            required: []
        }
    },
    {
        name: 'search_tasks',
        description: 'Retrieves a list of all tasks or searches for a specific tasks by name.',
        input_schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name or part of the task name. Optional.'
                },
                project_id: {
                    type: 'integer',
                    description: 'Filter tasks belonging strictly to this project ID. Optional.'
                },
                status: {
                    type: 'string',
                    description: 'Filter tasks by status: pending, in_progress, completed, or cancelled. Optional.'
                }
            },
            required: []
        }

    },
    {
        name: 'search_tasks',
        description: 'Retrieves a list of all tasks or searches for a specific tasks by name.',
        input_schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name or part of the task name. Optional.'
                }
            },
            required: []
        }
    },
    {
        name: 'get_project_status_and_summary',
        description: 'Retrieves comprehensive raw details of a specific project (including its tasks, deadlines, and current state) to analyze project health, generate progress summaries, suggest advancements, or devise strategic improvements.',
        input_schema: {
            type: 'object',
            properties: {
                type: 'integer',
                description: 'The unique ID of the project to look up.'
            },
            required: ['project_id']
        }
    },
    {
        name: 'get_total_worked_hours',
        description: 'Calculates and retrieves the sum of all logged working hours for a specific task or an entire project.',
        input_schema: {
            type: 'object',
            properties: {
                project_id: {
                    type: 'integer',
                    description: 'Calculate total hours for all tasks within this project ID. Optional.'
                },
                task_id: {
                    type: 'integer',
                    description: 'Calculate total hours spent strictly on this specific task ID. Optional.'
                }
            },
            required: []
        }
    }

]

async function executeTool(toolName, toolInput) {
    if (toolName === 'search_client') {
        const result = await pool.query('SELECT * FROM clients')
        return result.rows
    }
    if (toolName === 'search_projects') {
        const result = await pool.query(
            'SELECT projects.*, clients.company_name FROM projects LEFT JOIN clients ON projects.client_id = clients.id')
        return result.rows
    }
    if (toolName === 'search_tasks') {
        const result = await pool.query(
            'SELECT tasks.*, projects.id AS projects_id, projects.status AS projects_status FROM tasks LEFT JOIN projects ON tasks.project_id = projects.id WHERE tasks.project_id = $1')
        return result.rows
    }
    if (toolName === 'get_project_status_and_summary') {
        const result = await pool.query(
            'SELECT tasks.*, projects.name AS project_name, projects.status AS project_status FROM tasks LEFT JOIN projects ON tasks.project_id = projects.id WHERE tasks.project_id = $1')
        return result.rows
    }
    if (toolName === 'get_total_worked_hours') {
        const result = await pool.query(
            'SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600), 0) AS total_hours FROM task_hours LEFT JOIN tasks ON task_hours.task_id = tasks.id WHERE tasks.project_id = $1'
        )
        return result.rows

    }


}


assistantRouter.use(authenticateToken)

assistantRouter.post('/', async (req, res) => {
    try {
        const { message } = req.body
        const messages = [{ role: 'user', content: message }]
        let response = await client.messages.create({
            model: process.env.ANTHROPIC_MODEL,
            max_tokens: 1234,
            system: 'You are a project management assistant for Essedi. Always respond in the same language the user writes in. Do not use tables, use simple list and make it user friendly. When the usar has done, should answer with an specific word [CLOSE]',
            tools: tools,
            messages: messages
        })
        while (response.stop_reason === 'tool_use') {
            const toolBlock = response.content.find((block) => block.type === 'tool_use')
            const toolResult = await executeTool(toolBlock.name, toolBlock.input)
            messages.push({ role: 'assistant', content: response.content })
            messages.push({
                role: 'user',
                content: [{
                    type: 'tool_result',
                    tool_use_id: toolBlock.id,
                    content: JSON.stringify(toolResult)
                }]
            })
            response = await client.messages.create({
                model: process.env.ANTHROPIC_MODEL,
                max_tokens: 1234,
                system: 'You are a project management assistant for Essedi. Always respond in the same language the user writes in. Do not use tables, use simple list and make it user friendly. When the usar has done, should answer with an specific word [CLOSE]',
                tools: tools,
                messages: messages
            })
        }

        console.log(response.stop_reason)
        console.log(response.content)

        const finalText = response.content
        const filteredText = finalText.filter((block) => block.type === 'text')
        const mapedText = filteredText.map((line) => line.text)


        res.json(mapedText)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default assistantRouter