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
            required: []
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
        name: 'get_project_status_and_summary',
        description: 'Retrieves comprehensive raw details of a specific project (including its tasks, deadlines, and current state) to analyze project health, generate progress summaries, suggest advancements, or devise strategic improvements.',
        input_schema: {
            type: 'object',
            properties: {
                project_id: {
                    type: 'integer',
                    description: 'The unique ID of the project to look up.'
                }
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
    },
    {
        name: 'create_client',
        description: 'Creates a new client in the database with their contact details.',
        input_schema: {
            type: 'object',
            properties: {
                company_name: {
                    type: 'string',
                    description: 'The official name of the client company.'
                },
                contact_name: {
                    type: 'string',
                    description: 'Full name of the main contact person. Optional.'
                },
                phone: {
                    type: 'string',
                    description: 'Client phone number.'
                },
                email: {
                    type: 'string',
                    description: 'Client email address.'
                },
                address: {
                    type: 'string',
                    description: 'Client physical address. Optional.'
                }
            },
            required: ['company_name', 'phone', 'email']
        }
    },
    {
        name: 'create_project',
        description: 'Creates a new project and assigns it to an existing client.',
        input_schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the project.'
                },
                client_id: {
                    type: 'integer',
                    description: 'ID of the client this project belongs to. Use search_client first to get the ID.'
                },
                status: {
                    type: 'string',
                    description: 'Initial project status: pending, in_progress, started, or ended. Defaults to pending.'
                },
                end_date: {
                    type: 'string',
                    description: 'Expected end date for the project. Optional.'
                },
                notes: {
                    type: 'string',
                    description: 'Additional notes about the project. Optional.'
                }
            },
            required: ['name', 'client_id']
        }
    },
    {
        name: 'create_task',
        description: 'Creates a new task and assigns it to an existing project.',
        input_schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the tasks.'
                },
                project_id: {
                    type: 'integer',
                    description: 'ID of the project this tasks belongs to. Use search_projects first to get the ID.'
                },
                status: {
                    type: 'string',
                    description: 'Initial project status: pending, in_progress, started, or ended. Defaults to pending.'
                },
                due_date: {
                    type: 'string',
                    description: 'Expected end date for the project. Optional.'
                }
            },
            required: ['name', 'project_id', 'status']
        }
    },
    {
        name: 'create_service',
        description: 'Creates a new service',
        input_schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the service.'
                },
                code: {
                    type: 'string',
                    description: 'Code of the service.'
                },
                price: {
                    type: 'number',
                    description: 'Price of the service.'
                },
                vat: {
                    type: 'integer',
                    description: 'Vat of the service. Optional'
                }
            },
            required: ['name', 'code', 'price']
        }
    },
    {
        name: 'create_budget',
        description: 'Creates a new budget for a client, including the list of services with their quantities and prices. Calculates and stores the total automatically.',
        input_schema: {
            type: 'object',
            properties: {
                number: {
                    type: 'string',
                    description: 'Unique budget reference number, e.g. PRES-2026-001.'
                },
                client_id: {
                    type: 'integer',
                    description: 'ID of the client this budget is for. Use search_client first to get the ID.'
                },
                status: {
                    type: 'string',
                    description: 'Budget status: draft, submitted, accepted, or rejected. Defaults to draft.'
                },
                valid_until: {
                    type: 'string',
                    description: 'Expiration date of the budget. Optional.'
                },
                services: {
                    type: 'array',
                    description: 'List of services included in the budget, each with service_id, quantity, and unit_price.',
                    items: {
                        type: 'object',
                        properties: {
                            service_id: { type: 'integer', description: 'ID of the service. Use search results from the services table.' },
                            quantity: { type: 'integer', description: 'Quantity of this service.' },
                            unit_price: { type: 'number', description: 'Price per unit for this service.' }
                        },
                        required: ['service_id', 'quantity', 'unit_price']
                    }
                }
            },
            required: ['number', 'client_id', 'services']
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
        let query = 'SELECT tasks.*, projects.name AS project_name, clients.company_name FROM tasks LEFT JOIN projects ON tasks.project_id = projects.id LEFT JOIN clients ON projects.client_id = clients.id'
        const params = []
        if (toolInput.project_id) {
            query += ' WHERE tasks.project_id = $1'
            params.push(toolInput.project_id)
        }
        const result = await pool.query(query, params)
        return result.rows
    }
    if (toolName === 'get_project_status_and_summary') {
        const result = await pool.query(
            'SELECT tasks.*, projects.name AS project_name, projects.status AS project_status FROM tasks LEFT JOIN projects ON tasks.project_id = projects.id WHERE tasks.project_id = $1', [toolInput.project_id])
        return result.rows
    }
    if (toolName === 'get_total_worked_hours') {
        const result = await pool.query(
            'SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600), 0) AS total_hours FROM task_hours LEFT JOIN tasks ON task_hours.task_id = tasks.id WHERE tasks.project_id = $1', [toolInput.project_id])
        return result.rows

    }
    if (toolName === 'create_client') {
        const result = await pool.query(
            'INSERT INTO clients (company_name, contact_name, phone, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING *', [toolInput.company_name, toolInput.contact_name, toolInput.phone, toolInput.email, toolInput.address])
        return result.rows
    }
    if (toolName === 'create_project') {
        const result = await pool.query('INSERT INTO projects (name, client_id, status, end_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *', [toolInput.name, toolInput.client_id, toolInput.status, toolInput.end_date, toolInput.notes])
        return result.rows
    }
    if (toolName === 'create_task') {
        const result = await pool.query('INSERT INTO tasks (name, project_id, status, due_date) VALUES ($1, $2, $3, $4) RETURNING *', [toolInput.name, toolInput.project_id, toolInput.status, toolInput.due_date])
        return result.rows
    }
    if (toolName === 'create_service') {
        const result = await pool.query('INSERT INTO services (name, code, price, vat) VALUES ($1, $2, $3, $4) RETURNING *', [toolInput.name, toolInput.code, toolInput.price, toolInput.vat])
        return result.rows
    }
    if (toolName === 'create_budget') {
        const total = toolInput.services.reduce((sum, s) => sum + (s.quantity * s.unit_price), 0)

        const budgetResult = await pool.query(
            'INSERT INTO budgets (number, status, total, valid_until) VALUES ($1, $2, $3, $4) RETURNING *',
            [toolInput.number, toolInput.status || 'draft', total, toolInput.valid_until]
        )
        const budget = budgetResult.rows[0]

        for (const service of toolInput.services) {
            await pool.query(
                'INSERT INTO budget_services (budget_id, service_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
                [budget.id, service.service_id, service.quantity, service.unit_price]
            )
        }

        return budget
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
            const toolBlocks = response.content.filter((block) => block.type === 'tool_use')
            console.log('TOOL BLOCKS::', toolBlocks)
            const toolResults = []
            for (const tool of toolBlocks) {
                const result = await executeTool(tool.name, tool.input)
                console.log('EXECUTE TOOLS', tool.name, tool.input, result)
                toolResults.push(
                    {
                        type: 'tool_result',
                        tool_use_id: tool.id,
                        content: JSON.stringify(result)
                    }
                )
            }
            console.log('TOOL RESULTS', toolResults)
            messages.push({ role: 'assistant', content: response.content })
            messages.push({
                role: 'user',
                content: toolResults
            })
            response = await client.messages.create({
                model: process.env.ANTHROPIC_MODEL,
                max_tokens: 1234,
                system: 'You are a project management assistant for Essedi. Always respond in the same language the user writes in. Do not use tables, use simple list and make it user friendly. When the usar has done, should answer with an specific word [CLOSE]',
                tools: tools,
                messages: messages
            })
        }


        const finalText = response.content
        console.log('Response:', finalText)
        const filteredText = finalText.filter((block) => block.type === 'text')
        const mapedText = filteredText.map((line) => line.text)


        res.json(mapedText)
    } catch (error) {
        console.log('ERROR:', error.message, error)
        res.status(500).json({ error: error.message })
    }
})

export default assistantRouter