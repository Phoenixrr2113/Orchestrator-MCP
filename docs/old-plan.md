# Doppl: Enhanced  Code MCP Server

## Project Overview
Build a better version of  Code as an MCP (Model Context Protocol) server that other clients can use. This will be developed iteratively, starting with basic MCP server setup and gradually adding tools and functions one by one.

## Goals
- Create a comprehensive MCP server that mirrors and enhances  Code's capabilities
- Enable any MCP-compatible client to access advanced coding assistance tools
- Build iteratively with testing at each step
- Maintain high code quality and documentation
- Integrate with modern AI tooling (Vercel AI SDK + OpenRouter)

## Technology Stack

### Core MCP Server (TypeScript/Node.js)
- **Language**: TypeScript (excellent MCP SDK + native Vercel AI SDK integration)
- **Runtime**: Node.js (great for I/O operations and async handling)
- **Framework**: MCP TypeScript SDK for server development
- **Transport**: STDIO (standard for MCP servers)
- **Dependencies**:
  - `@modelcontextprotocol/sdk` - Core MCP SDK
  - `ai` - Vercel AI SDK for LLM interactions
  - `@openrouter/ai-sdk-provider` - OpenRouter provider
  - `zod` - Schema validation and type safety
  - `simple-git` - Git operations
  - `chokidar` - File watching
  - Additional libraries as needed per tool

### AI Integration Layer
- **AI SDK**: Vercel AI SDK (`ai` package) - native TypeScript integration
- **LLM Provider**: OpenRouter (`@openrouter/ai-sdk-provider`) for model access
- **Models**: Access to multiple models through OpenRouter (GPT-4, Claude, etc.)
- **Features**:
  - Tool calling and function execution
  - Structured data generation with `generateObject()`
  - Streaming responses with `streamText()`
  - Token usage tracking and cost management

## Development Phases

### Phase 1: Foundation Setup ✅
- [ ] Initialize Python project with uv
- [ ] Set up MCP server with FastMCP
- [ ] Create basic server structure
- [ ] Test connection with Claude Desktop
- [ ] Set up development environment
- [ ] Create basic logging and error handling

### Phase 2: Core File Operations (Priority 1)
- [ ] **view** - File/directory viewing with regex search
- [ ] **str-replace-editor** - File editing capabilities
- [ ] **save-file** - Create new files
- [ ] **remove-files** - Delete files safely
- [ ] Test all file operations thoroughly

### Phase 3: Basic Context Engine (Priority 1)
- [ ] **codebase-retrieval** - Basic file-based code search (ripgrep-style)
- [ ] **diagnostics** - Get IDE issues/errors
- [ ] **view-range-untruncated** - View specific line ranges
- [ ] **search-untruncated** - Search within content
- [ ] **file-indexing** - Basic file system indexing
- [ ] **ast-parsing** - Simple AST generation for major languages
- [ ] Test basic codebase analysis features

### Phase 3.5: Basic Memory System (Priority 1)
- [ ] **remember** - Simple JSON-based memory storage
- [ ] **recall** - Basic memory retrieval
- [ ] **conversation-context** - Session-based context tracking
- [ ] **project-memory** - Project-specific memory storage
- [ ] Test basic memory functionality

### Phase 4: AI-Enhanced Tools (Priority 1)
- [ ] **ai-code-review** - AI-powered code review using Vercel AI SDK
- [ ] **ai-code-generation** - Generate code with AI assistance
- [ ] **ai-documentation** - Auto-generate documentation
- [ ] **ai-refactoring** - Intelligent code refactoring suggestions
- [ ] **ai-debugging** - AI-assisted debugging and error analysis
- [ ] Test AI integration features

### Phase 5: Web and API Integration (Priority 2)
- [ ] **web-search** - Google Custom Search integration
- [ ] **web-fetch** - Webpage content retrieval
- [ ] **open-browser** - Browser automation
- [ ] Test web integration features

### Phase 6: Version Control (Priority 2)
- [ ] **github-api** - GitHub API integration
- [ ] Git operations (status, commit, push, etc.)
- [ ] Branch management
- [ ] PR and issue management
- [ ] Test version control features

### Phase 7: Process Management (Priority 2)
- [ ] **launch-process** - Execute shell commands
- [ ] **read-process** - Read process output
- [ ] **write-process** - Write to process stdin
- [ ] **kill-process** - Terminate processes
- [ ] **list-processes** - List active processes
- [ ] **read-terminal** - Terminal interaction
- [ ] Test process management

### Phase 8: Database and External Services (Priority 3)
- [ ] **supabase** - Supabase Management API
- [ ] Database query capabilities
- [ ] Authentication handling
- [ ] Test database integrations

### Phase 9: Advanced Context Engine (Priority 3)
- [ ] **vector-embeddings** - Semantic code search with embeddings
- [ ] **rag-pipeline** - Full RAG implementation for code
- [ ] **code-relationships** - Advanced AST analysis and dependency mapping
- [ ] **semantic-search** - AI-powered code understanding
- [ ] **real-time-indexing** - Incremental updates and file watching
- [ ] **context-ranking** - Intelligent relevance scoring
- [ ] Test advanced context engine

### Phase 9.5: Advanced Memory System (Priority 3)
- [ ] **persistent-memory** - Database-backed memory (SQLite/PostgreSQL)
- [ ] **memory-embeddings** - Vector-based memory retrieval
- [ ] **learning-system** - Adaptive memory that learns from usage
- [ ] **context-aware-recall** - Smart memory integration with context engine
- [ ] **memory-compression** - Efficient long-term memory storage
- [ ] Test advanced memory features

### Phase 10: AI-Enhanced Intelligence (Priority 3)
- [ ] **resolve-library-id** - Library resolution
- [ ] **get-library-docs** - Documentation retrieval
- [ ] **sequential-thinking** - Complex reasoning
- [ ] **render-mermaid** - Diagram generation
- [ ] **ai-code-understanding** - Use AI to enhance context retrieval
- [ ] **intelligent-suggestions** - Proactive code suggestions
- [ ] Task management tools
- [ ] Test AI-enhanced features

### Phase 10: Optimization and Polish (Priority 4)
- [ ] Performance optimization
- [ ] Enhanced error handling
- [ ] Comprehensive logging
- [ ] Documentation generation
- [ ] Security hardening
- [ ] Rate limiting
- [ ] Caching mechanisms

### Phase 11: Testing and Deployment (Priority 4)
- [ ] Unit tests for all tools
- [ ] Integration tests
- [ ] Performance benchmarks
- [ ] Documentation website
- [ ] Distribution packaging
- [ ] CI/CD pipeline

## Project Structure
```
doppl/
├── src/
│   ├── index.ts               # Main MCP server entry point
│   ├── server.ts              # MCP server setup and configuration
│   ├── tools/                 # Tool implementations
│   │   ├── index.ts
│   │   ├── file-ops.ts        # File operations
│   │   ├── codebase.ts        # Basic codebase tools
│   │   ├── ai-tools.ts        # AI-enhanced tools
│   │   ├── web.ts             # Web integration
│   │   ├── git.ts             # Version control
│   │   ├── process.ts         # Process management
│   │   ├── database.ts        # Database tools
│   │   └── advanced.ts        # Advanced features
│   ├── context/               # Context Engine
│   │   ├── index.ts
│   │   ├── indexer.ts         # File and code indexing
│   │   ├── parser.ts          # AST parsing and analysis
│   │   ├── retriever.ts       # Code retrieval and search
│   │   ├── embeddings.ts      # Vector embeddings for semantic search
│   │   └── rag.ts             # RAG pipeline implementation
│   ├── memory/                # Memory System
│   │   ├── index.ts
│   │   ├── storage.ts         # Memory storage backends
│   │   ├── retrieval.ts       # Memory retrieval and recall
│   │   ├── learning.ts        # Adaptive learning system
│   │   └── context-aware.ts   # Context-aware memory integration
│   ├── ai/                    # AI integration layer
│   │   ├── index.ts
│   │   ├── client.ts          # OpenRouter + Vercel AI SDK client
│   │   ├── prompts.ts         # AI prompt templates
│   │   └── models.ts          # Model configurations
│   ├── utils/                 # Utility functions
│   │   ├── index.ts
│   │   ├── logging.ts
│   │   ├── errors.ts
│   │   └── helpers.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts
│   │   └── tools.ts
│   └── config.ts              # Configuration
├── tests/                     # Test suite
├── docs/                      # Documentation
├── examples/                  # Usage examples
├── package.json               # Project configuration
├── tsconfig.json              # TypeScript configuration
├── README.md
└── plan.md                    # This file

```

## Testing Strategy
1. **Unit Testing**: Each tool tested individually
2. **Integration Testing**: Test tool interactions
3. **Client Testing**: Test with multiple MCP clients
4. **Performance Testing**: Ensure scalability
5. **Manual Testing**: Real-world usage scenarios

## Success Criteria
- [ ] All core  Code tools replicated and enhanced
- [ ] Compatible with Claude Desktop and other MCP clients
- [ ] Performance equal or better than original 
- [ ] Comprehensive documentation
- [ ] Stable and reliable operation
- [ ] Easy installation and configuration

## Key Implementation Details

### MCP Server Architecture
- Use **MCP TypeScript SDK** with clean async/await patterns
- Implement tools as async functions for better performance
- Use **Zod schemas** for input/output validation and type safety
- Support both STDIO and HTTP transports
- Leverage TypeScript's type system for compile-time error checking

### AI Integration Strategy
- **Vercel AI SDK** provides unified interface to multiple LLM providers
- **OpenRouter** gives access to GPT-4, Claude, Llama, and other models
- Use `generateText()` for simple completions
- Use `streamText()` for real-time responses
- Use `generateObject()` for structured data generation
- Use `embed()` for generating vector embeddings
- Implement tool calling for complex AI workflows
- Native TypeScript integration ensures type safety throughout

### Context Engine Strategy
- **Phase 1**: File-based search and basic AST parsing
- **Phase 2**: Vector embeddings for semantic search
- **Phase 3**: Full RAG pipeline with intelligent retrieval
- **Phase 4**: AI-enhanced code understanding and suggestions
- Use incremental development to build sophistication over time

### Memory System Strategy
- **Phase 1**: Simple JSON-based storage for conversations and projects
- **Phase 2**: Database-backed persistent memory with search
- **Phase 3**: Vector-based memory retrieval and learning
- **Phase 4**: Context-aware memory that integrates with code understanding
- Design for scalability from the beginning

### Development Workflow
1. **Setup**: Initialize with `npm`/`pnpm` and install dependencies
2. **Develop**: Create tools one at a time using MCP SDK patterns
3. **Build**: Compile TypeScript to JavaScript
4. **Test**: Test server with MCP Inspector or direct client connections
5. **Install**: Configure for Claude Desktop integration
6. **Iterate**: Test each tool thoroughly before moving to next

## Next Immediate Steps
1. Set up TypeScript project with npm/pnpm
2. Install MCP TypeScript SDK and Vercel AI SDK dependencies
3. Configure OpenRouter API key and client
4. Create basic server structure with MCP TypeScript SDK
5. Build and test connection with Claude Desktop
6. Implement first tool (view) and test thoroughly
7. Add AI integration layer with simple code review tool

## Notes
- Focus on one tool at a time with thorough testing
- Maintain compatibility with existing  workflows
- Document each tool's capabilities and limitations
- Consider performance implications of each implementation
- Plan for extensibility and plugin architecture
- Leverage AI capabilities to enhance traditional tools
- Use structured outputs for better integration with other tools
