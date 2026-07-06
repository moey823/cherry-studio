import type * as ChatPrimitives from '@renderer/components/chat/primitives'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ButtonHTMLAttributes, CSSProperties, PropsWithChildren, ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement, useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockUseAgentSessionContextUsage = vi.hoisted(() => {
  type UseAgentSessionContextUsageMock = (
    sessionId: string | undefined,
    expectedModels?: readonly (string | null | undefined)[],
    fallbackSnapshot?: unknown
  ) => { percentage: null; usage: null; source: 'none' }
  return vi.fn<UseAgentSessionContextUsageMock>(() => ({ percentage: null, usage: null, source: 'none' }))
})

vi.mock('@cherrystudio/ui', () => ({
  Badge: ({ children }: PropsWithChildren) => <span>{children}</span>,
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  HoverCard: ({ children }: PropsWithChildren) => <div>{children}</div>,
  HoverCardContent: ({ children }: PropsWithChildren) => <div data-testid="status-shortcut-preview">{children}</div>,
  HoverCardTrigger: ({ children }: PropsWithChildren) =>
    isValidElement(children) ? (
      // eslint-disable-next-line @eslint-react/no-clone-element -- mock reproduces Radix asChild slot behavior
      cloneElement(children as ReactElement<Record<string, unknown>>, { 'data-hover-card-trigger': 'true' })
    ) : (
      <>{children}</>
    ),
  HorizontalScrollContainer: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Tabs: ({ children }: PropsWithChildren) => <div>{children}</div>,
  TabsContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
  TabsList: ({ children }: PropsWithChildren) => <div>{children}</div>,
  TabsTrigger: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  Tooltip: ({ children }: PropsWithChildren) => <>{children}</>
}))

vi.mock('@renderer/components/chat/shell/RightPaneHost', () => ({
  RightPaneHost: ({
    children,
    onCloseAnimationComplete,
    open,
    style
  }: PropsWithChildren<{
    onCloseAnimationComplete?: () => void
    open?: boolean
    style?: CSSProperties
  }>) => {
    useEffect(() => {
      if (!open) onCloseAnimationComplete?.()
    }, [onCloseAnimationComplete, open])

    return (
      <section data-testid="right-pane" data-open={String(Boolean(open))} style={style}>
        {open ? children : null}
      </section>
    )
  }
}))

vi.mock('@renderer/components/chat/primitives', async (importActual) => ({
  ...(await importActual<typeof ChatPrimitives>()),
  EmptyState: () => <div data-testid="empty-state" />
}))

vi.mock('@renderer/components/chat/agent/ContextUsageSummary', () => ({
  ContextUsageSummary: () => <div data-testid="context-usage" />,
  getAgentContextUsageColor: () => 'success'
}))

vi.mock('@renderer/components/chat/messages/MessageList', () => ({
  default: () => <div data-testid="message-list" />
}))

vi.mock('@renderer/components/chat/messages/MessageListProvider', () => ({
  MessageListProvider: ({ children }: PropsWithChildren) => <>{children}</>
}))

vi.mock('@renderer/utils/filePath', () => ({
  resolveInlineFilePath: (path: string) => path
}))

vi.mock('@renderer/components/chat/panes/ArtifactPane', () => ({
  ArtifactFilePreview: () => <div data-testid="artifact-preview" />,
  ArtifactPaneView: () => <div data-testid="artifact-pane" />,
  isOfficeDocumentFile: () => false,
  resolveArtifactPaneFileSelection: () => null
}))

vi.mock('@renderer/components/chat/panes/OpenExternalAppButton', () => ({
  default: () => <button type="button">Open external</button>
}))

vi.mock('@renderer/components/chat/panes/useArtifactFileTreeModel', () => ({
  isSelectableFileNode: () => true,
  useArtifactFileTreeModel: () => ({
    hasLoaded: false,
    nodeById: {},
    resetLazyChildren: vi.fn()
  })
}))

vi.mock('@renderer/components/chat/trace/TracePane', () => ({
  TracePane: () => <div data-testid="trace-pane" />
}))

vi.mock('@renderer/components/command', () => ({
  CommandTooltip: ({ children }: PropsWithChildren) => <>{children}</>
}))

vi.mock('@renderer/components/Scrollbar', () => ({
  default: ({ children }: PropsWithChildren) => <div>{children}</div>
}))

vi.mock('@renderer/data/hooks/usePreference', () => ({
  usePreference: (key: string) => (key === 'app.developer_mode.enabled' ? [true, vi.fn()] : [undefined, vi.fn()])
}))

vi.mock('@renderer/hooks/agent/useAgentSessionCompaction', () => ({
  useAgentSessionCompaction: () => ({ status: 'idle' })
}))

vi.mock('@renderer/hooks/agent/useAgentSessionContextUsage', () => ({
  useAgentSessionContextUsage: mockUseAgentSessionContextUsage
}))

vi.mock('@renderer/hooks/command', () => ({
  useCommandHandler: vi.fn()
}))

vi.mock('@renderer/hooks/tab', () => ({
  useIsActiveTab: () => true
}))

vi.mock('@renderer/hooks/useFileSize', () => ({
  useFileSize: () => undefined
}))

vi.mock('@renderer/hooks/useIsTextFile', () => ({
  useIsTextFile: () => 'text'
}))

vi.mock('@renderer/pages/agents/messages/agentMessageListAdapter', () => ({
  useAgentMessageListProviderValue: () => ({
    state: {
      renderConfig: {}
    }
  })
}))

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: PropsWithChildren) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>
  },
  useReducedMotion: () => false
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

import { AgentRightPane } from '../AgentRightPane'

describe('AgentRightPane', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows top shortcuts for stable right-pane tabs and keeps the status hover preview', () => {
    render(
      <AgentRightPane
        resourcePane={{ node: <div data-testid="resource-list">Resources</div>, label: 'agent.session.list.title' }}
        sessionId="session-a"
        workspacePath="/workspace"
        messages={[]}
        partsByMessageId={{}}>
        <AgentRightPane.Shortcuts />
        <AgentRightPane.Host />
      </AgentRightPane>
    )

    expect(screen.queryByRole('button', { name: 'agent.session.list.title' })).toBeNull()
    expect(screen.getByRole('button', { name: 'agent.right_pane.tabs.files' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'agent.right_pane.tabs.status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'trace.label' })).toBeInTheDocument()
    expect(screen.getByTestId('status-shortcut-preview')).toBeInTheDocument()

    const statusShortcut = document.querySelector('[data-shell-tab-shortcut="status"]')
    expect(statusShortcut).toBeInTheDocument()
    expect(statusShortcut).toHaveAttribute('data-hover-card-trigger', 'true')

    fireEvent.click(statusShortcut as HTMLElement)

    expect(screen.getByTestId('right-pane')).toHaveAttribute('data-open', 'true')
    expect(document.querySelector('[data-shell-tab-shortcut="status"]')).toBeNull()
  })

  it('hides file and status shortcuts when their matching tabs are disabled', () => {
    render(
      <AgentRightPane
        resourcePane={{ node: <div data-testid="resource-list">Resources</div>, label: 'agent.session.list.title' }}
        filesEnabled={false}
        statusEnabled={false}
        sessionId="session-a"
        workspacePath="/workspace"
        messages={[]}
        partsByMessageId={{}}>
        <AgentRightPane.Shortcuts />
        <AgentRightPane.Host />
      </AgentRightPane>
    )

    expect(screen.queryByRole('button', { name: 'agent.session.list.title' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'agent.right_pane.tabs.files' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'agent.right_pane.tabs.status' })).toBeNull()
  })

  it('passes current model candidates to right-pane context usage consumers', () => {
    render(
      <AgentRightPane
        sessionId="session-a"
        modelFallback={{
          id: 'anthropic::claude-sonnet-4-5',
          name: 'Claude Sonnet 4.5',
          provider: 'anthropic'
        }}
        workspacePath="/workspace"
        messages={[]}
        partsByMessageId={{}}>
        <AgentRightPane.Shortcuts />
        <AgentRightPane.Host />
      </AgentRightPane>
    )

    const statusShortcut = document.querySelector('[data-shell-tab-shortcut="status"]')
    fireEvent.click(statusShortcut as HTMLElement)

    const matchingCalls = mockUseAgentSessionContextUsage.mock.calls.filter(
      ([sessionId, expectedModels]) =>
        sessionId === 'session-a' &&
        Array.isArray(expectedModels) &&
        expectedModels.includes('anthropic::claude-sonnet-4-5') &&
        expectedModels.includes('claude-sonnet-4-5')
    )
    expect(matchingCalls.length).toBeGreaterThanOrEqual(2)
  })
})
