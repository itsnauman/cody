import * as vscode from 'vscode'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SimpleChatModel } from './SimpleChatModel'
import { DefaultPrompter } from './prompt'

describe('DefaultPrompter', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('constructs a prompt with no context', async () => {
        const chat = new SimpleChatModel('a-model-id')
        chat.addHumanMessage({ text: 'Hello' })

        const { prompt, newContextUsed } = await new DefaultPrompter([], () =>
            Promise.resolve([])
        ).makePrompt(chat, 100000)

        expect(prompt).toMatchInlineSnapshot(`
          [
            {
              "speaker": "human",
              "text": "You are Cody, an AI coding assistant from Sourcegraph.",
            },
            {
              "speaker": "assistant",
              "text": "I am Cody, an AI coding assistant from Sourcegraph.",
            },
            {
              "speaker": "human",
              "text": "Hello",
            },
          ]
        `)
        expect(newContextUsed).toMatchInlineSnapshot('[]')
    })

    it('adds the cody.chat.preInstruction vscode setting if set', async () => {
        const getConfig = vi.spyOn(vscode.workspace, 'getConfiguration')
        getConfig.mockImplementation((section, resource) => ({
            get: vi.fn(() => 'Always respond with 🧀 emojis'),
            has: vi.fn(() => true),
            inspect: vi.fn(() => ({ key: 'key' })),
            update: vi.fn(() => Promise.resolve()),
        }))

        const chat = new SimpleChatModel('a-model-id')
        chat.addHumanMessage({ text: 'Hello' })

        const { prompt, newContextUsed } = await new DefaultPrompter([], () =>
            Promise.resolve([])
        ).makePrompt(chat, 100000)

        expect(prompt).toMatchInlineSnapshot(`
          [
            {
              "speaker": "human",
              "text": "You are Cody, an AI coding assistant from Sourcegraph. Always respond with 🧀 emojis",
            },
            {
              "speaker": "assistant",
              "text": "I am Cody, an AI coding assistant from Sourcegraph.",
            },
            {
              "speaker": "human",
              "text": "Hello",
            },
          ]
        `)
        expect(newContextUsed).toMatchInlineSnapshot('[]')
    })
})
