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
        name: 'search_projects',
        description: 'Retrieves a list of all projects or searches for a specific project by name.',
        input_schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name or part of the project name. Optional.'
                }
            },
            required: []
        }
    },
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
    }
]

async function executeTool(toolName, toolInput) {
    if (toolName === 'search_projects') {
        const result = await pool.query(
            'SELECT projects.*, clients.company_name FROM projects LEFT JOIN clients ON projects.client_id = clients.id')
        return result.rows
    }

    if (toolName === 'search_client') {
        const result = await pool.query('SELECT * FROM clients')
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