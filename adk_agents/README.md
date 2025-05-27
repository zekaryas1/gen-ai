# ADK(Google's agent development kit)


https://github.com/user-attachments/assets/3b28f5c2-f22f-40b6-b365-4e9cc2f28dd3


- Two Agents
    1. Weather Agent
      - Quick start task from the documentation
    2. File Analytics agent(Main)
      - CSV analyzer agent using SQL


## How to run File Analytic agent
- open project
  - `uv sync`
- Open agents folder
  - `cd agents`
  - create .env file and add the following info
    - GOOGLE_GENAI_USE_VERTEXAI=FALSE
    - GOOGLE_API_KEY=...
- Open ask web interface, while inside agents folder
  - `adk web`
    - select `file_analytics_agent` from dropdown
    - `say hello` or upload a csv file to interact with the agent
