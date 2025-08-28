from collections import Counter
from typing import Dict, TypedDict
from google.adk.agents import Agent, LoopAgent
from google.adk.tools import ToolContext, google_search

AGENT_MODEL = "gemini-2.0-flash"


# Define TypedDict for tool responses
class ToolResponse(TypedDict):
    status: str
    report: str | Dict[str, int]
    error_message: str | None


def limited_weather_tool(city: str) -> ToolResponse:
    """
    Retrieves the current weather report for a specified city.

    Args:
        city: The name of the city for which to retrieve the weather report (non-empty string).

    Returns:
        A dictionary with 'status' ('success' or 'error'), 'report' (weather description if success),
        and 'error_message' (error details if failed).
    """
    if not city or not city.strip():
        return {
            "status": "error",
            "report": "",
            "error_message": "City name is required and cannot be empty."
        }

    if city.lower() == "new york":
        return {
            "status": "success",
            "report": (
                "The weather in New York is sunny with a temperature of 25 degrees Celsius "
                "(77 degrees Fahrenheit)."
            ),
            "error_message": None
        }
    return {
        "status": "error",
        "report": "",
        "error_message": f"Weather information for '{city}' is not available."
    }


def letter_counter_tool(word: str) -> ToolResponse:
    """
    Counts the frequency of each character in a given word.

    Args:
        word: The word to count letters from (non-empty string).

    Returns:
        A dictionary with 'status' ('success' or 'error'), 'report' (character counts if success),
        and 'error_message' (error details if failed).
    """
    if not word or not word.strip():
        return {
            "status": "error",
            "report": {},
            "error_message": "Word is required and cannot be empty."
        }

    return {
        "status": "success",
        "report": dict(Counter(word)),
        "error_message": None
    }


def exit_loop(tool_context: ToolContext) -> Dict:
    """
    Signals the end of the iterative process when no further changes are needed.

    Args:
        tool_context: The context of the agent calling the tool.

    Returns:
        An empty dictionary (JSON-serializable).
    """
    print(f"[Tool Call] exit_loop triggered by {tool_context.agent_name}")
    tool_context.actions.escalate = True
    return {}


research_agent = Agent(
    name="research_agent",
    model=AGENT_MODEL,
    instruction="""
You are an AI Research Assistant that answers user questions by conducting research using the `google_search` tool. Your task is to create or refine a research draft based on the user's query.

Tasks
    1. New Research:
       - If no refinement point is provided, start a new research draft.
       - Use `google_search` to gather relevant information.
       - Produce a concise, well-structured draft summarizing key findings.
    2. Refine Existing Draft:
       - If a refinement point is provided, research that specific aspect.
       - Incorporate the new information into the existing draft.
       - Ensure the draft remains cohesive and relevant.

Guidelines
    - Extract the topic or keywords from the user's query.
    - If the query is unclear, ask for clarification.
    - Use `google_search` effectively to find accurate, reliable information.
    - Format the draft in a clear, readable manner (e.g., bullet points or paragraphs).
    - Avoid duplicating information already in the draft unless it adds value.

Examples
    - Query: "Research the history of the internet"
      - Action: Use `google_search` to find key events and milestones.
      - Output: A draft summarizing the internet's history (e.g., ARPANET, WWW).
    - Query: "Add recent advancements to the internet history draft"
      - Action: Search for advancements (e.g., 5G, Web3) and update the draft.

### Variables
- refinement_point = {{refinement_point?}}: The specific aspect to research and add to the draft (if provided).
- draft = {{draft?}}: The current working draft to refine (if provided).
""",
    description="An AI agent that conducts research using Google Search to create or refine drafts based on user queries.",
    tools=[google_search],
    output_key="draft"
)

refinement_agent = Agent(
    name="refinement_agent",
    model=AGENT_MODEL,
    instruction="""
You are an AI Research Refinement Agent responsible for reviewing a research draft and identifying areas for improvement. 
Your task is to analyze the current draft and either suggest further research or signal completion.

Tasks
    1. Analyze Draft:
       - Review the current draft.
       - Identify missing, incomplete, or unclear aspects that need further research.
    2. Suggest Refinement:
       - If improvements are needed, output a specific "point to consider" for the research agent to address.
       - Ensure the point is clear, actionable, and relevant to the draft.
    3. Signal Completion:
       - If the draft is complete and no further improvements are needed, call `exit_loop` to end the iterative process.
       - Do not output anything when calling `exit_loop`.

Guidelines
    - Focus on gaps in content, outdated information, or areas lacking depth.
    - Provide a single, precise refinement point if further research is needed.
    - Avoid vague suggestions; specify what aspect needs attention (e.g., "Include recent advancements in 2025").
    - If the draft is satisfactory, call `exit_loop` immediately.

Examples
    - Draft: "The internet began with ARPANET in the 1960s..."
      - Output: "point to consider: Add information on the impact of 5G on internet development."
    - Draft: A complete, up-to-date draft with no gaps.
      - Action: Call `exit_loop`, no output.

Variables
    - draft = {{draft}}: The current research draft to analyze.
""",
    description="An AI agent that reviews research drafts, suggests refinements, or signals completion when no further changes are needed.",
    tools=[exit_loop],
    output_key="refinement_point"
)

research_agent_loop = LoopAgent(
    name="research_agent",
    sub_agents=[
        research_agent,
        refinement_agent
    ],
    max_iterations=5
)

root_agent = Agent(
    name="workflow_agent",
    model=AGENT_MODEL,
    instruction="""
You are an AI Coordination Agent that handles user queries by delegating tasks to appropriate tools or sub-agents. Your role is to interpret the user's intent and select the correct action.

Tasks
1. Weather Queries:
   - Use `limited_weather_tool` for queries about current weather.
   - Extract the city name from the query.
   - If no city is specified, return an error message: "Please specify a city for the weather query."
   - Example: "What's the weather in New York?" → Call `limited_weather_tool` with city="New York".

2. Letter Counting Queries:
   - Use `letter_counter_tool` for queries about counting letters in a word.
   - Extract the word from the query.
   - If no word is specified, return an error message: "Please specify a word to count letters."
   - Example: "How many letters in 'hello'?" → Call `letter_counter_tool` with word="hello".

3. Research Queries:
   - Delegate research-related queries to `research_agent_loop`.
   - Example: "Research AI advancements" → Delegate to `research_agent_loop`.

Guidelines
    - Extract required inputs (city, word, or topic) accurately from the query.
    - If inputs are missing or unclear, return a clear error message.
    - Do not use tools for tasks they are not designed for.

- Examples
    - Query: "What's the weather like in Paris?"
      - Action: Call `limited_weather_tool` with city="Paris".
      - Response: Return the tool's output or error message.
    - Query: "Count letters in apple"
      - Action: Call `letter_counter_tool` with word="apple".
    - Query: "Research quantum computing"
      - Action: Delegate to `research_agent_loop`.
      - Response: Return the final draft from the loop.
    - Query: "What's the weather?"
      - Response: "Please specify a city for the weather query."
""",
    description="An AI agent that coordinates user queries, delegating to tools for weather, letter counting, or research tasks.",
    sub_agents=[research_agent_loop],
    tools=[
        limited_weather_tool,
        letter_counter_tool
    ]
)
