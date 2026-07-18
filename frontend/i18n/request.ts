import { getRequestConfig } from 'next-intl/server'
import it from '../messages/it.json'
import en from '../messages/en.json'
import es from '../messages/es.json'

const messages = { it, en, es }

export default getRequestConfig(async () => {
    return {
        locale: 'it',
        messages: messages['it']
    }
})