# Orchestrator MCP

An intelligent MCP (Model Context Protocol) server that orchestrates multiple MCP servers and provides AI-enhanced workflow automation and intelligent tool routing.

## 🌟 Features

### Core Orchestration
- **Multi-Server Orchestration**: Connect to multiple MCP servers simultaneously
- **Universal Compatibility**: Works with npm, uvx, Python, and other MCP server types
- **Server Management**: Dynamic server discovery and health monitoring
- **Scalable Architecture**: Easy to add new servers and capabilities

### 🧠 AI Enhancement Layer (NEW!)
- **Intelligent Tool Routing**: AI analyzes requests and selects optimal tools
- **Workflow Automation**: Multi-step processes orchestrated automatically
- **Intent Understanding**: Natural language request analysis and planning
- **Context Synthesis**: Combines results from multiple tools into coherent responses
- **Result Enhancement**: AI improves and formats outputs for better user experience

### Built-in Capabilities
- **Web Fetching**: HTTP content retrieval capabilities
- **Fallback Mode**: Graceful degradation when AI is not available

## Current Status

🎉 **Phase 4: AI Enhancement Layer - COMPLETE!**

The orchestrator now features a complete AI enhancement layer with intelligent routing, workflow automation, and context synthesis.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure AI features** (optional but recommended):
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenRouter API key
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Run the orchestrator**:
   ```bash
   npm start
   ```

## MCP Integration

### For Stdio MCP Server:
- **Name**: `Orchestrator MCP`
- **Command**: `node`
- **Arguments**: `/path/to/orchestrator-mcp/dist/index.js`

### For Development:
- **Command**: `npx`
- **Arguments**: `orchestrator-mcp` (after publishing to npm)

## 🛠️ Available Tools

### Core AI Enhancement Tools
The orchestrator exposes a minimal set of tools focused on unique capabilities that enhance AI assistants:

- `ai_process` - **Primary Interface** - Process requests using AI orchestration with intelligent tool selection
- `get_info` - System introspection - Get information about connected servers and available capabilities
- `ai_status` - Health monitoring - Get the status of AI orchestration capabilities

### Connected Server Tools
All tools from connected MCP servers are automatically available through AI orchestration:
- **Filesystem operations** (read, write, search files)
- **Git operations** (repository management, status, history)
- **Memory system** (knowledge graph storage)
- **Web fetching** (fetch and process web content)
- **Web search** (DuckDuckGo search for current information)
- **Browser automation** (Playwright for web testing)
- **Security analysis** (Semgrep for vulnerability scanning)
- And more...

## 🔗 Connected Servers

Currently configured servers:

- **filesystem** (npm) - File operations with secure access controls
- **sequential-thinking** (npm) - Dynamic problem-solving through thought sequences
- **git** (uvx) - Git repository tools and operations
- **memory** (npm) - Knowledge graph-based persistent memory
- **fetch** (uvx) - Enhanced web content fetching
- **github** (npm) - Official GitHub API integration (requires GITHUB_TOKEN)
- **playwright** (npm) - Browser automation and web testing
- **puppeteer** (npm) - Alternative browser automation

## 🤖 AI Configuration

To enable AI features, you need an OpenRouter API key:

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Set the environment variable:
   ```bash
   export OPENROUTER_API_KEY=your_api_key_here
   ```
3. Optionally configure other AI settings:
   ```bash
   export OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet
   export OPENROUTER_MAX_TOKENS=2000
   export OPENROUTER_TEMPERATURE=0.7
   ```

### AI Models Supported
The orchestrator works with any model available on OpenRouter, including:
- Anthropic Claude (recommended)
- OpenAI GPT models
- Meta Llama models
- Google Gemini models
- And many more!

## 📖 Usage Examples

### Primary AI Interface
```bash
# Code Analysis & Development
{"tool": "ai_process", "arguments": {"request": "Find all TypeScript files with TODO comments and create a summary report"}}
{"tool": "ai_process", "arguments": {"request": "Analyze the codebase architecture and identify potential improvements"}}
{"tool": "ai_process", "arguments": {"request": "Check git status, review recent commits, and summarize changes since last week"}}

# Research & Information Gathering
{"tool": "ai_process", "arguments": {"request": "Search for Next.js 15 new features and create a comparison with version 14"}}
{"tool": "ai_process", "arguments": {"request": "Fetch the latest TypeScript 5.3 release notes and extract breaking changes"}}
{"tool": "ai_process", "arguments": {"request": "Research React Server Components best practices and save key insights to memory"}}

# Security & Quality Analysis
{"tool": "ai_process", "arguments": {"request": "Run security analysis on all JavaScript files and prioritize vulnerabilities by severity"}}
{"tool": "ai_process", "arguments": {"request": "Analyze code quality across the project and generate improvement recommendations"}}

# Complex Multi-Step Workflows
{"tool": "ai_process", "arguments": {"request": "Search for React testing best practices, analyze our current test files, and suggest specific improvements"}}
{"tool": "ai_process", "arguments": {"request": "Fetch competitor documentation, compare with our API design, and identify feature gaps"}}
```

### System Introspection
```bash
# Get server information and capabilities
{"tool": "get_info", "arguments": {}}

# Check AI orchestration health
{"tool": "ai_status", "arguments": {}}
```

### AI-Enhanced Workflows
The `ai_process` tool can handle complex requests like:
- "Analyze my project structure and suggest improvements"
- "Find recent commits and create a summary"
- "Search for TODO comments and organize them by priority"
- "Take a screenshot of the homepage and analyze its performance"

## 🏗️ Architecture

### Multi-Runtime Support
The orchestrator uses a registry-based architecture supporting:
- **npm servers**: TypeScript/JavaScript servers via npx
- **uvx servers**: Python servers via uvx
- **Built-in tools**: Native orchestrator capabilities

### AI Enhancement Layer
```
User Request → Intent Analysis → Tool Selection → Workflow Planning → Execution → Result Synthesis
```

## ⚙️ Configuration

### Server Configuration
Server configurations are managed in `src/orchestrator/server-configs.ts`. Each server includes:
- Runtime environment (npm, uvx, python, etc.)
- Command and arguments
- Environment requirements
- Enable/disable status
- Development phase assignment

### Environment Variables
See `.env.example` for all available configuration options.

## 🔧 Development

- `npm run dev` - Watch mode for development
- `npm run build` - Build the project
- `npm test` - Run tests (when available)

## 📝 License

MIT
