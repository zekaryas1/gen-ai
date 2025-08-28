# ADK(Google's agent development kit)


https://github.com/user-attachments/assets/3b28f5c2-f22f-40b6-b365-4e9cc2f28dd3


- Multiple Agents
    1. Weather Agent
      - Quick start task from the documentation
    2. File Analytics agent(Main)
      - CSV analyzer agent using SQL
    3. Simple agentic rag
      - decide is a query is rag based or followup question
    4. Simple query analyzer
      - Sql query generator and deconstructor
    5. Todo agent
       - Todo crud manager ai assistance
    6. Workflow agent
       - Research assistance in loop
       - with extra weather and letter counter tools


## How to get started
- open project
  - `uv sync`
- Open agents folder
  - `cd agents`
  - create .env file and add the following info
    - GOOGLE_GENAI_USE_VERTEXAI=FALSE
    - GOOGLE_API_KEY=...
- Open ask web interface, while inside agents folder
  - `uv run adk web`
  - open `http://localhost:8000`
    - select one of the agents from the dropdown
        - ex:`file_analytics_agent` from dropdown
          - `say hello` or upload a csv file to interact with the agent
