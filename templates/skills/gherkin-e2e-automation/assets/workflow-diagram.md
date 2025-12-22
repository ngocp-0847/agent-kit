# Gherkin E2E Automation Workflow Diagrams

Visual representations of the AI-powered test generation workflow.

## Overall Architecture

```mermaid
graph TB
    A[Google Sheets Test Cases] --> B[Sheets Service]
    B --> C[Gherkin Generator]
    C --> D[Gherkin Features]
    
    E[Application UI] --> F[UI Scanner]
    F --> G[UI Model]
    
    D --> H[AI Service]
    G --> H
    H --> I[Selector Mapper]
    I --> J[Test Generator]
    J --> K[Playwright Tests]
    
    L[Page Objects] --> K
    M[Test Utilities] --> K
    
    subgraph "AI Integration"
        H
        N[Claude/GPT-4]
        O[Prompt Engineering]
        H --> N
        O --> H
    end
    
    subgraph "Output"
        K
        P[Test Reports]
        Q[Coverage Reports]
        K --> P
        K --> Q
    end
```

## Data Flow Pipeline

```mermaid
sequenceDiagram
    participant GS as Google Sheets
    participant SS as Sheets Service
    participant GG as Gherkin Generator
    participant US as UI Scanner
    participant AI as AI Service
    participant SM as Selector Mapper
    participant TG as Test Generator
    participant PT as Playwright Tests

    GS->>SS: Extract test cases
    SS->>GG: Convert to Gherkin
    GG->>GG: Validate & format
    
    par UI Scanning
        US->>US: Scan application UI
        US->>US: Extract elements & selectors
    end
    
    GG->>AI: Send Gherkin scenarios
    US->>AI: Send UI model
    AI->>SM: Generate selector mappings
    SM->>TG: Map steps to actions
    TG->>PT: Generate test code
    
    PT->>PT: Validate & format
    PT->>PT: Execute tests
```

## Component Interaction

```mermaid
graph LR
    subgraph "Input Layer"
        A[Google Sheets]
        B[Gherkin Files]
        C[Application UI]
    end
    
    subgraph "Processing Layer"
        D[Sheets Parser]
        E[Gherkin Parser]
        F[UI Scanner]
        G[AI Service Manager]
    end
    
    subgraph "AI Layer"
        H[Claude Service]
        I[OpenAI Service]
        J[Prompt Templates]
        K[Response Parser]
    end
    
    subgraph "Generation Layer"
        L[Selector Mapper]
        M[Test Generator]
        N[Page Object Generator]
        O[Code Validator]
    end
    
    subgraph "Output Layer"
        P[Playwright Tests]
        Q[Page Objects]
        R[Test Reports]
    end
    
    A --> D
    B --> E
    C --> F
    
    D --> G
    E --> G
    F --> G
    
    G --> H
    G --> I
    J --> H
    J --> I
    
    H --> K
    I --> K
    K --> L
    K --> M
    K --> N
    
    L --> O
    M --> O
    N --> O
    
    O --> P
    O --> Q
    O --> R
```

## Test Generation Process

```mermaid
flowchart TD
    A[Start] --> B{Input Type?}
    
    B -->|Google Sheets| C[Extract Sheet Data]
    B -->|Gherkin File| D[Parse Gherkin]
    
    C --> E[Convert to Gherkin]
    E --> F[Validate Gherkin]
    D --> F
    
    F --> G[Scan Target UI]
    G --> H[Build UI Model]
    
    H --> I[AI Selector Mapping]
    F --> I
    
    I --> J{Mapping Confidence > 80%?}
    J -->|No| K[Manual Review Required]
    J -->|Yes| L[Generate Test Code]
    
    K --> M[Update Mappings]
    M --> L
    
    L --> N[Validate Generated Code]
    N --> O{Code Valid?}
    
    O -->|No| P[Fix Code Issues]
    P --> L
    O -->|Yes| Q[Generate Page Objects]
    
    Q --> R[Format & Organize Code]
    R --> S[Run Test Validation]
    S --> T[Output Test Files]
    T --> U[End]
```

## AI Integration Flow

```mermaid
graph TB
    subgraph "Input Processing"
        A[Gherkin Step] --> B[Step Analysis]
        C[UI Elements] --> D[Element Classification]
    end
    
    subgraph "AI Processing"
        B --> E[Prompt Construction]
        D --> E
        E --> F[AI Service Call]
        F --> G[Response Parsing]
        G --> H[Validation]
    end
    
    subgraph "Output Generation"
        H --> I{Valid Response?}
        I -->|No| J[Retry with Modified Prompt]
        I -->|Yes| K[Selector Mapping]
        J --> F
        K --> L[Code Generation]
        L --> M[Quality Check]
    end
    
    subgraph "Fallback Handling"
        N[Primary AI Service Fails] --> O[Try Secondary Service]
        O --> P[Manual Fallback]
        P --> Q[Default Selectors]
    end
```

## Error Handling Strategy

```mermaid
graph TD
    A[Operation Start] --> B{Try Primary Service}
    
    B -->|Success| C[Return Result]
    B -->|Fail| D[Log Error]
    
    D --> E{Retry Count < Max?}
    E -->|Yes| F[Wait & Retry]
    F --> B
    E -->|No| G{Fallback Available?}
    
    G -->|Yes| H[Try Fallback Service]
    H -->|Success| C
    H -->|Fail| I[Try Manual Mapping]
    
    G -->|No| I
    I -->|Success| C
    I -->|Fail| J[Report Failure]
    
    J --> K[Use Default Selectors]
    K --> L[Mark for Manual Review]
    L --> C
```

## Deployment Pipeline

```mermaid
graph LR
    subgraph "Development"
        A[Write Gherkin] --> B[Local Testing]
        B --> C[Code Review]
    end
    
    subgraph "CI/CD Pipeline"
        C --> D[Automated Generation]
        D --> E[Test Validation]
        E --> F[Quality Gates]
        F --> G[Deploy to Staging]
    end
    
    subgraph "Production"
        G --> H[Staging Tests]
        H --> I[Production Deploy]
        I --> J[Monitor Results]
    end
    
    subgraph "Feedback Loop"
        J --> K[Collect Metrics]
        K --> L[Update AI Prompts]
        L --> M[Improve Generation]
        M --> A
    end
```

## Performance Optimization

```mermaid
graph TB
    subgraph "Caching Layer"
        A[Request Cache] --> B[Response Cache]
        B --> C[UI Model Cache]
        C --> D[Generated Code Cache]
    end
    
    subgraph "Batch Processing"
        E[Batch Requests] --> F[Parallel Processing]
        F --> G[Rate Limiting]
        G --> H[Result Aggregation]
    end
    
    subgraph "Optimization Strategies"
        I[Prompt Optimization] --> J[Model Selection]
        J --> K[Response Streaming]
        K --> L[Incremental Updates]
    end
    
    A --> E
    E --> I
    I --> M[Performance Monitoring]
    M --> N[Adaptive Scaling]
```

These diagrams provide a comprehensive visual understanding of the Gherkin E2E Automation workflow, from input processing through AI integration to final test generation and deployment.