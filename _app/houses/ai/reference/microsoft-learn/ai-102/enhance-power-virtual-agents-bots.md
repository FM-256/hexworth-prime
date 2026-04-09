# Enhance Microsoft Copilot Studio agents

**Module slug:** `enhance-power-virtual-agents-bots`
**Source:** https://learn.microsoft.com/en-us/training/modules/enhance-power-virtual-agents-bots/
**Units:** 7

## Table of Contents

1. Introduction
2. Use Power Automate to add actions
3. Transfer conversations to agents by using Omnichannel for Customer Service
4. Create topics for existing support content
5. Analyze agent performance
6. Check your knowledge
7. Summary

---


# Introduction

- 2 minutes
Microsoft Copilot Studio empowers your teams to create powerful agents through
a guided, no-code graphical interface. This ability allows you to use the
benefits of agents without having to rely on data scientists or developers,
and it helps to address many of today's challenges in building agents. With
Microsoft Copilot Studio, you can eliminate the gap between the subject matter
experts and development teams that are building the agents, and you can reduce
latency between teams recognizing an issue and updating the agent to address
the issue. Microsoft Copilot Studio also removes the complexity of exposing
teams to the nuances of conversational AI and the need to write complex code.
Microsoft Copilot Studio helps make creating agents quick and simple, and it
includes the following features that help you enhance your agent's
functionality to make it even more powerful:
- Create actions that initiate Microsoft Power Automate flows - You can
initiate Power Automate flows directly from topics in your agent. The
actions feature allows you to include personalized information for other
services in the message content that is being provided.
- Pass conversations to live agents - Copilot agents can be configured
to pass conversations, including the context of the conversation, to
applications such as Omnichannel for Microsoft Dynamics 365 Customer
Service, where live agents can take over the task of working on the
conversation.
- Generative AI â You can use Generative AI to boost your conversations
and use Generative AI. You can use public-facing or Bing-indexed
websites, upload your own documents, as well connect in SharePoint, and
Azure OpenAI.
This module will examine some of the additional capabilities that are
available to help you enhance your Microsoft Copilot Studio agents.

---


# Use Power Automate to add actions

- 6 minutes
Frequently, when an agent interacts with customers, it might require
information from other applications to provide the customer with a personalized
experience. For example, if a customer asks about the weather for their
location, the agent could pass the location details, such as the customer's
city and postal address, to a weather service that retrieves the forecast
for their location. The forecast details can be sent back to the agent, which
can then include those values in a message back to the customer.
In Microsoft Copilot Studio these are referred to as actions. Actions call Power
Automate Flows to help automate activities, call operating systems, or engage
with external applications. For example, with an action that calls a Power
Automate flow, it would pass the location information that is captured in the
agent to an external service and then send the forecast details back to the
Microsoft Copilot Studio agent.
Power Automate flows are called from within topics by using the Call an action node. You can use a flow that already exists in your Power Apps environment , or you can create one from within the Microsoft Copilot Studio authoring canvas . To allow a Power Automate flow to interact with a Microsoft Copilot Studio agent, it requires a special Microsoft Copilot Studio trigger. This trigger captures data from the agent and sends response information back to the agent.
Power Automate provides the following trigger and action:
- Run a flow from Copilot - Trigger that specifies input parameters that
are captured from the Microsoft Copilot Studio agent.
- Respond to Copilot - Action that defines output
parameters that are sent back to the Microsoft Copilot Studio agent.
When a new flow is created from a Microsoft Copilot Studio agent, a starter
template is loaded that includes the Run a flow from Copilot trigger and the
Respond to Copilot action. You need to define the necessary input and output
parameters and complete the structure of the flow.

## Work with input and output parameters

Variables that are defined in your agent can be to supply values to input
parameters and consume values from output parameters. For example, a customer's
response to the "What city do you live in?" question could be used as the value
for a City input parameter.

### Input parameters

Input parameters represent values that are captured in the Microsoft Copilot
Studio agent and used by the Power Automate flow steps. No limit is placed on
the number of input parameters that you can add. However, you can only use
text, boolean, files, email, number, and date types as input parameters with
Power Automate flows.
Consider what type of data is required when the input parameter is passed
through the flow. For example, if you intend on sending a customer's city and
zip code to the MSN weather service, you might configure the input parameters
as shown in the following figure.
| Name | Data type |
|---|---|
| City | Text |
| Zip_Code | Number |
The City parameter was defined as Text because MSN Weather consumes city
names as text. The Zip_Code parameter was set to Number because it's
consumed as a number. Each service that Power Automate can interact with is
different, so make sure that you take time to understand how it works.
When a Get forecast for today MSN Weather action is added, the city and zip
code are passed to the location so that MSN Weather knows what forecast to
get.

### Output parameters

Output parameters are values from a Power Automate flow that are returned to
the Microsoft Copilot Studio agent. Like input parameters, output parameters
can be a text, boolean, file, email, number, or date type.
Returning to the previous weather example, after the flow has received the
forecast details from the MSN weather service, you create output parameters
to store the details that are returned by the MSN weather service, where the
values can be consumed by the Microsoft Copilot Studio agent. For example, if
you want to present the customer with a summary and chance of rain percentage
for their location, you might create the following output parameters.
| Name | Data Type |
|---|---|
| Day_summary | Text |
| Location | Text |
| Chance_of_rain | Number |
The actual details to include come from the information that is received in
the MSN forecast.
All flows that are created from the Microsoft Copilot Studio authoring canvas
are saved in a default solution in Power Automate and they can be used by your
agents immediately.

### Call a Power Automate flow as an action from an agent

After your flow has been created, it can be initiated from your agent topic by
using the Call an action node. When you call the action, variables can be
passed to the flow as input parameters. Make sure that you have created a
topic with appropriate trigger phrases. For example, you can create a Get
Weather topic that includes trigger phrases such as:
- Will it rain?
- What's the weather?
- Get weather
To pass location information as variables to the Power Automate flow, you
need to capture them. The simplest way to accomplish this task is with the Ask
a question node. You use the Identify field on the question node to
define what type of data that you want to capture. For example, you could set
one item on the Identify field to City and the other to Zip code .
The responses to these questions are stored in variables.
After you have defined the questions that you use to capture the details, add
a new Call an action conversation node to the agent by selecting the
weather flow that you created previously.
In the flow configuration, you need to map the flow input blocks to the
output variables from the question nodes. For example, City (text) gets its
value from City (city) and Zipcode (number) gets its value from Zip
(number) .
Now, you should be able to observe that the Get weather Forecast flow runs and what output parameters are returned from it.
Under the flow's node, add a Message node and then enter a message that uses
the flow's outputs.
For example: Today's forecast for (x)location:{x}day_summary. Chance of
rain is {x}chance_of_rain%.
For more information, see Use Power Automate flows in Microsoft Copilot Studio .

---


# Transfer conversations to agents by using Omnichannel for Customer Service

- 5 minutes
Situations might occur where an agent needs to hand off a conversation to a
live agent. This situation often happens when a user has asked for information
that the agent doesn't know, or after the agent has captured the necessary
information that is required to ensure that the conversation can be routed
correctly to a live agent. When an agent hands off a conversation to live
agent, it shares the full history of the conversation (the context) and any
variables with the agent. Microsoft Copilot Studio agents can be configured to
hand off conversations to agents for organizations that use customer engagement
applications to conduct a generic handoff, as described in configure generic handoff . This feature allows
your customer engagement application to route incoming escalations to the
appropriate live agent queue, and it also allows the live agents to review
exactly what occurred in the prior conversation so that they can resume at that
point. This process prevents agents from potentially asking for information that
was previously captured by the agent.

### Transfer conversations to agents

Two primary components that are involved when an agent transfers to an agent
are:
- Telling the agent when to transfer the conversation to an agent.
- Telling the agent where to transfer the conversation.

### Tell the agent when to transfer the conversation to an agent

The way that Microsoft Copilot Studio tells the agent that it's time to
transfer a conversation to an agent is always the same. Microsoft Copilot Studio
includes the Topic management conversation node, which includes options for
switching between different topics, and how to potentially end a conversation.
It provides multiple actions that can be initiated:
- Go to another topic â Allows you to specify another topic that the user
should be redirected to.
- End current topic â The current topic is ended to ensure that it's
considered completed.
- End all topics â Any previously initiated topics in the conversation
is closed.
- Transfer conversation - Escalates the conversation to a live
agent .
- Go to step â Allows you to select any node within the current topic to
redirect users to.
- End conversation â Ends the conversation
Agent authors can initiate a transfer to an agent from within a specific
topic. For example, if a customer indicates that their entire point-of-sale
system is down, the agent can automatically call the Transfer conversation node and transfer it to an agent. Another way to accomplish this task is through
the Escalate topic. All agents include a conversation topic called Escalate , which includes a message that is presented to the customer. You
can modify the Escalate topic to include a Topic Management node that would
transfer to an agent. The Escalate topic is automatically triggered when
someone types content such as, "speak to agent." You can also trigger the Escalate topic from within another topic by selecting Go to another
topic and then selecting it.

### Configure where to hand off the conversation

To facilitate the transfer of a conversation to an agent, you need to
configure the agent to send the conversation to a customer engagement hub such
as Dynamics 365 Customer Service instance.
Your agent can be configured to send conversations to the following customer
engagement hubs:
- Dynamics 365 Customer Service
- Genesys
- LivePerson
- Salesforce
- ServiceNow
- ZenDesk
- Custom engagement hub
Only published agents can be used to ensure that the end-to-end capabilities work as expected. Make sure that you have published your agent prior to validating the integrated experience.
When you create the connection between Microsoft Copilot Studio and Dynamics 365
Customer Service, a Microsoft Entra ID application registration is used to call
the agent. Creating the application registration is done on the Azure portal . You can register your apps by going to Microsoft Entra ID and creating a new registration under App registrations .
Three primary areas that can be defined when you create the application
registration are:
- Name - User-facing name of the application. This name can be changed
later, if necessary.
- Supported account types - This area defines who can access the
application.
- Redirect URL (optional) - This area contains the URL for where the app
is located.
After you have defined the parameters, select the Register button.
For more information, see Use the portal to create an Microsoft Entra ID application and service principal that can access resources .

### Configure transfer to agent

Each agent can only be configured to send conversations to one Dynamics 365
Customer Service instance. You can define the Dynamics 365 instance in the
individual agent. If conversations from multiple agents are sent to your
Dynamics 365 instance, each agent needs to be configured individually.
To configure the handoff, select Channels and go to Customer engagement
hub . This screen allows you to define how the agent facilitates handoff
to different applications. Select the Dynamics 365 Customer Service tile to
begin the configuration process.
You need to select the Dynamics 365 Customer Service environment that you
want to use with the agent. Make sure that you select an environment where
your Dynamics 365 Customer Service instance is provisioned. The list shows all
available environments, even if Dynamics 365 Customer Service isn't provisioned.
The primary component that you need to provide is the application ID for the app
that you previously created for the Microsoft Entra ID registration. Dynamics
365 Customer Service models agents as application users in the application.
Modeling agents as application users ensures that the agent can have
conversations sent to it like a human agent would. It's important that the
application ID is unique to your organization (your Microsoft Dataverse
organization or environment). Each agent that interacts with the same
Dynamics 365 Customer Service environment needs to use a different
application ID. You might need to create multiple application registrations to
support multiple agents.
In your Azure portal, go to Microsoft Entra ID and select App registrations .
All registered applications are displayed. Select the application that you
want to use with the agent. The application ID is on the Applications
overview page. Copy the ID and paste it into the Microsoft Copilot Studio
Application ID field.
Microsoft Copilot Studio uses a Microsoft Teams channel to communicate with Dynamics 365 Customer Service. As you go through the setup wizard, if a Teams channel hasn't been enabled, one is enabled automatically.
When the connection has been established, you can select the Go to Omnichannel link to continue configuring the agent connection in Omnichannel for Customer Service .
Note
When your agent is in the same environment as your deployed customer service it automatically detects the instance and makes the connection.

### Use IVR with Omnichannel for Customer Service

Native voice integration in Microsoft Copilot Studio will dramatically improve the experience of building voice-enabled bots for customers using the voice channel in Omnichannel for Customer Service . Including voice responses and analysis in your bot can increase the ways your customers interact with your business. Voice integration can provide faster, more efficient resolutions to common questions, improving your deflection rate and customer satisfaction scores.
To enable voice optimization in your Copilot Studio agent, navigate to your agent's Settings page and select the Voice tab from the navigation menu on the left-hand side. After enabling the Optimize for voice toggle, a number of customizable options are revealed and include the following:
- Increase accuracy with agent data : Adds voice-specific data pulled from your agent's data and pushed to your speech recognition model.
- DTMF : Dual-tone multi-frequency, this setting determines how your agent receives input from a dial pad and allows you to specify the Interdigit timeout and Termination timeout lengths.
- Silence detection : Modifies agent behavior when it doesn't detect any input from the end user.
- Speech collection : Sets limits on how long your agent tries to detect and collect user input.
- Latency messaging : Defines when and how users hear a latency message when background operations are experiencing excessive latency. Individual latency messages can be configured directly in agent topics and plugins.
- Speech sensitivity : Modifies the filter level in response to background noise.
After enabling voice optimization, you have the ability to modify the following list of node-level settings:
- Speech & DTMF : Allows the node's properties to be modified by user speech and dual-tone multi-frequency (keypad) input.
- SSML : Configures the text-to-speech style in message nodes and can include playing audio pre-recorded audio files in place of text-to-speech.
- Assign DTMF keys to options : Allows you to assign user responses to DTMF keys.

### Enhance IVR with generative answers optimized for voice

By integrating your voice-enabled agent through Dynamics 365 Customer Service, you can drastically improve self-service capabilities and significantly reduce the load on your agents by enabling generative answers optimized for voice interactions.
For example, you can give users the opportunity to decide if they want to make use of a generative answer by creating a topic with the DTMF global command received trigger. By allocating a specific DTMF command, and informing users further up the conversation tree of the command's use, you can give users the opportunity to ask questions about the agent's general knowledge or commonly answered questions provided as knowledge sources. This process lessens the load on your live agent, leaving them with more time to focus on problems only they can solve.
Create a new topic and decide on a DTMF command that doesn't interfere with previously allocated commands. This command will be global, and whenever a user selects this command, they'll be navigated back to this topic.
Add a question node with a message prompting the user for their question. Identify the User's entire response and Save the user response as a variable. Give this variable an appropriate name like genUserQuestion .
Finally, add a Generative answers node after the question node and set the Input value to your genUserQuestion variable. Generative answer nodes can be further customized by determining its knowledge sources and if you want the agent to use its own general knowledge. With Copilot Studio's voice optimization settings, the agent can also provide a Latency Message to fill time and inform the user that the agent is generating the answer.
Under Advanced , you can either have the agent respond directly with its answer by enabling Send a message , or save it as a variable and perform further actions depending on the response's content.

### Remove Dynamics 365 Customer Service connection

You can select Disconnect agent to disable the application user that
represents the agent in your omnichannel instance. This disconnects the
agent from the specified omnichannel environment. To add your agent back,
you need to connect it again.
For more information, see Integrate a Microsoft Copilot Studio agent and configure generic handoff .

---


# Create topics for existing support content

- 4 minutes
As AI technology advances, it's providing organizations with multiple
opportunities to provide more and better ways to enhance productivity and guide
employees. Copilot Studio allows you
to use Generative answers in multiple ways. Once you are in Copilot studio,
generative AI capabilities can be accessed by selecting Generative AI from
the Settings menu.
With Copilot studio, you can use Generative AI capabilities to do the
following:
- Use generative answers as fallback: Allows you to use generative answers
as a fallback in instances where your agent is unable to find a relevant
answer to the user's question.
- Insert generative answers into Topics: Allows you to integrate
Generative AI into your topics by using the generative answer node.
- Use Copilot to create agents and topics: Copilot allows you to provide a
brief description of the agent or topic that you want to create, and it
builds it out for you.

## Use generative answers as a fallback

In the past, if an agent was unable to determine a user's intent, it would ask
them to rephrase their question. If the agent was unable to identify a topic
after two prompts, it would escalate to a live agent.
With generative answers, Microsoft Copilot Studio allows your agent to find
and present information from multiple sources, internal or external, without
created topics. This allows you to use generative answers as primary information
sources or as a fallback source when authored topics can't answer a user's
query. As a result, this dramatically reduces the time it takes to create
and deploy a functional agent, removing the need to manually author multiple
topics that might not address all customer questions.
All agents include a Conversational boosting topic. This topic runs when
your agent is unable to identify a topic that addresses the user's question.
The first thing you need to identify when using generative AI is the
knowledge sources that are used to populate your answers. You can define the
knowledge sources you want to use, on the Knowledge tab.
As of the publication of this course the following knowledge sources are
available.
External resources:
- Public websites : Allows you to connect to public websites as a source for
real-time answers.
- Files : Allows you to upload different files as knowledge sources. The
contents of the uploaded files are searched for results.
- SharePoint : Allows you to connect your organizations SharePoint site as
a knowledge sources.
- Dataverse (Preview): Allow you to connect to your organizations
Microsoft Dataverse instance as a source of knowledge. Important Additional enterprise data sources such as Azure SQL, Salesforce, ServiceNow, Zendesk, and more are currently in Preview.
Dataverse (Preview): Allow you to connect to your organizations
Microsoft Dataverse instance as a source of knowledge.
Important
Additional enterprise data sources such as Azure SQL, Salesforce, ServiceNow, Zendesk, and more are currently in Preview.
The Generative AI page in Copilot Studio allows you to tailor the generative
capabilities of your agent. It provides you with different options for
configuring Generative AI in your agent. You can access the Generative AI
configuration page by going to Settings > Generative AI .
On the Generative AI settings page, you can define the following:
- How your agent interacts with people: This defines how you want
answers to be populated for people who are interacting with your agent.
You can select from the following: Classic: This uses topics that you build to respond to trigger
phrases. Actions that can only be called from inside a topic. Generative (preview) - This uses generative AI to respond to the
users' questions with the best combination of defined actions, topics,
and knowledge
How your agent interacts with people: This defines how you want
answers to be populated for people who are interacting with your agent.
You can select from the following:
- Classic: This uses topics that you build to respond to trigger
phrases. Actions that can only be called from inside a topic.
- Generative (preview) - This uses generative AI to respond to the
users' questions with the best combination of defined actions, topics,
and knowledge
- How strict should the content moderation be: Allows you to specify how
relevant you want the answers that are generated to be. You can choose from
the following options: Low â More creative: The answers generated are pooled from more
sources, and might not be the most relevant answers. Medium â More balanced: They answer generated come from a
smaller more relevant pool of data. High â More precise: This provides the most relevant and precise
answers. This option also increases the likely hood that it's
unable to find a relevant answer.
How strict should the content moderation be: Allows you to specify how
relevant you want the answers that are generated to be. You can choose from
the following options:
- Low â More creative: The answers generated are pooled from more
sources, and might not be the most relevant answers.
- Medium â More balanced: They answer generated come from a
smaller more relevant pool of data.
- High â More precise: This provides the most relevant and precise
answers. This option also increases the likely hood that it's
unable to find a relevant answer.
- Image input - Allows users to upload images the agent can then analyze.
- Enhanced search results - Enhances Microsoft 365 Copilot tenants to provide improved search performance
To learn more about generative answers, see: Generative answers as a fallback.
To learn more about content moderation, see: Content moderation .

## Website & SharePoint URLs

To provide your agent with a wider range of knowledge, you can provide URLs to
different websites and SharePoint sites. The URL is used to represent the scope
of the content that is used to generate responses. To maximize the amount
of data your agent has access to, there are multiple things to consider.
URLs can have up to two levels of depth / subpaths indicated by a forward
slash.
The following items, represent examples of valid URLs:
- www.contoso.com
- www.fabrikam.com/engines/rotary
- www.fabrikam.com/engines/rotary/
An example of an invalid URL would be:
- www.fabrikam.com/engines/rotary/dual-shaft
While you're limited to up to two subdomains in the URL that doesn't necessarily
mean that you're limited to two subdomains in your results. Any publicly
viewable content in the URL you specify (including subdomains under a top-level
domain) generates content for your agent. For example, If you were to enter www.fabrikam.com as your URL, data from www.fabrikam.com/engines/rotary , and www.fabrikam.com/engines/rotary/dual-shaft would be looked at to potentially
be returned as results.
Another consideration is how to specify the domain. If you enter something like
use www.fabrikam.com (the www exists), only content from the www is
returned. Content located on news.fabrikam.com (the www doesn't exist) isn't
used, since news. Is a subdomain under the top-level domain fabrikam.com ?
If instead, you were to enter fabrikam.com , then content on www.fabrikam.com and content from news.fabrikam.com is used, since they both sit under the
top-level domain fabrikam.com .
Other items to consider include:
- Social network & forum URLs: Your agent might generate nonsensical,
irrelevant, or inappropriate answers if you use a forum or social network
site as your URL. Therefore, community content on social networks often
increases the risk of more answers being rejected.
- Search engine URLs: Don't include URLs of search engines like bing.com , as they don't provide useful responses.
- SharePoint: SharePoint URLs can be added. It's recommended to omit https:// from the URL. Recognized SharePoint
URLs are from the sharepoint.com domain. SharePoint site URLs
can't be more than two levels deep. Content from aspx files on
SharePoint won't be used to generate answers.
SharePoint: SharePoint URLs can be added.
- It's recommended to omit https:// from the URL. Recognized SharePoint
URLs are from the sharepoint.com domain. SharePoint site URLs
can't be more than two levels deep. Content from aspx files on
SharePoint won't be used to generate answers.
For more information on URLs, see: URL considerations.

## Uploading documents

Another option you can use as a data source for generative answers is to upload your own documents for your agent. The documents are used across your agent; however, you do have the ability to specify any nodes that shouldn't be used in the uploaded documents.
Once uploaded, when an agent user asks a question, and the agent doesn't have
a defined topic to use, the agent generates an answer from your uploaded
documents. The agent uses generative AI to answer the user's question and
provides an answer in a conversational style. Uploaded documents are stored
securely in Dataverse. The number of documents you can upload is only limited by
the available file storage for your Dataverse environment, and the maximum size
per file is 512 MB.
Uploaded file content is available to anyone chatting with the agent, regardless of file permissions or access controls.
To learn details about supported file types and sizes, see: Use uploaded documents for generative answers.

## Use generative answers with search and summarize content

Once you have defined the content that you want to use with generative AI,
that data is used for fallback generative answers. However, you might find
scenarios where generative answers would be helpful within specific topics of
your agent. You can accomplish this by using the Create generative answers node. This special node allows you to specify additional sources that are
searched based on your inputs. Information sources defined in the Generative
answers node override sources you specified at the agent level, which
functions as a fallback.
Generative answers can be added to a topic, by selecting the plus icon to open
the new node menu, and under Advanced , selecting Generative answers .
This creates a new node called Create generative answers.
Any item that is defined as a knowledge source can be used as a knowledge source
for individual topics. Initially, all defined knowledge sources are
available, but you can control which knowledge sources you want to use.
You have the following options available:
- Search only selected sources: Allows you to specify which configured
knowledge sources you want to use for this topic.
- Allow AI to use its own general knowledge: AI uses public
websites to identify answers that might best meet the criteria.
- Content moderation level: Allows you to specify the content moderation
settings that you want to use for this topic. These are separate from the
Content moderation settings that you defined at the agent level.

---


# Analyze agent performance

- 5 minutes
After an agent is deployed and customers are interacting with it, statistics that are related to the agent will become available. You can access this information through the Analytics tab in the side navigation pane. On this tab, you can find key performance indicators (KPIs) that show the volume of sessions that your agent has handled, how effectively your agent was able to engage users and resolve issues, escalation rates to live agents, and abandonment rates during conversations. You'll find customer satisfaction information at the KPI level and on the Customer Satisfaction tab.
You can also view detailed session history and transcripts by selecting Sessions from the Analytics tab. On the Sessions page, you can download a file with the full session transcript, which can be a helpful way for you to adjust the performance of your agent and change the content in your topics to improve your agent's efficiency.

### Analyze agent performance and usage

The Summary page gives you a broad overview of your agent's performance.
It uses AI technology to show you which topics have the greatest impact on
escalation rate, abandon rate, and resolution rate. For more information, see the table under Summary charts .
The Summary page includes various charts with graphical views of your agent's KPIs:
- Summary charts - Summarize KPIs for a specified period and the percent change over the period.
- Engagement over time chart - Graphical view of the number of engaged and unengaged sessions over time.
- Session outcomes over time chart - Graphical view of the daily resolution rate, escalation rate, and abandon rate over the specified time period.
- Resolution rate drivers chart - Displays topics in order of their impact on the resolution rate over the specified time period.
- Escalation rate drivers chart - Displays topics in order of their impact on the escalation rate over the specified time period.
- Abandon rate drivers chart - Displays topics in order of their impact on the abandon rate over the specified time period.
For more information, see Analyze agent performance and usage .
The Engagement rate drivers , Abandon rate drivers , and Resolution rate
drivers charts use natural language understanding to group issues as topics.
These charts show you the topics that have the most impact on the performance of
your agent.

### Analyze customer satisfaction for Microsoft Copilot Studio agents

The Customer Satisfaction page provides a detailed view of customer satisfaction (CSAT) survey data, including the average CSAT score over time and the topics that have the most impact on the CSAT score. The Customer Satisfaction page includes various charts with graphical views of your agent's customer satisfaction indicators:
- Customer satisfaction drivers chart - Uses AI to group related support cases as topics and then displays topics in order of their impact on customer satisfaction over the specified time period.
- Scores over time chart - Provides a graphical view of the average CSAT score over the specified time period.
- Average CSAT score - Provides a graphical view of the average of CSAT scores for sessions in which customers respond to an end-of-session request to take the survey.
- CSAT survey response rate - Shows the number of CSAT surveys that were presented and the percentage of surveys that were completed.
For more information, see Analyze customer satisfaction .

### Analyze topic usage in Microsoft Copilot Studio

The topic details page provides a view into the performance of individual topics and how they can be improved. You can display the topic details page by selecting the Detail link in one of the following charts on the Summary and Customer Satisfaction pages:
- Summary page Escalation rate drivers Abandon rate drivers Resolution rate drivers
Summary page
- Escalation rate drivers
- Abandon rate drivers
- Resolution rate drivers
- Customer Satisfaction page Customer satisfaction drivers
Customer Satisfaction page
- Customer satisfaction drivers
The topic details page can also be displayed by opening an individual topic from
the Topics page and selecting Analytics at the top of the page.
The topic details page includes various charts with graphical views of a topic's KPIs:
- Topic Summary charts - Summarize topic performance indicators for the specified time period and the percent change over the period.
- Impact Summary charts - Summarize the impact of the topic on KPIs for the specified time period.
- Topic Volume by Day chart - Provides a graphical view of the number of sessions for the topic over the specified time period.
For more information, see Analyze topics usage .

### Analyze session information in Microsoft Copilot Studio

Having access to session information that is related to your agent can help you identify potential changes that need to be made. By default, you can download up to seven days of agent conversation transcript sessions from the past 30 days directly from the Microsoft Copilot Studio portal.
Session transcripts are available by going to Analytics > Sessions tab. On the Sessions tab, you'll be able to see all the different sessions that have been run for the agent. A session represents a conversation that someone had with the agent. If your agent had a high number of sessions, they'll be broken down into multiple rows to help make managing the sessions easier. Each row will contain 2,500 sessions. You can select each row to download the session transcripts for the specified time frame.
The downloaded file contains the following information:
- SessionID - A unique identifier for each session.
- StartDateTime - Time at which the session started. Entries are sorted by
this column in descending order.
- InitialUserMessage - First message that is entered by the user.
- TopicName - Name of the last authored topic that was triggered in this
session.
- ChatTranscript - Transcript of the session in the following format: User says:" "; Agent says:" "; structure Conversation turns are separated by semicolons Agent says doesn't include the options that are presented to the
user
ChatTranscript - Transcript of the session in the following format:
- User says:" "; Agent says:" "; structure
- Conversation turns are separated by semicolons
- Agent says doesn't include the options that are presented to the
user
- SessionOutcome - Outcome of the session (Resolved, Escalated, Abandoned,
Unengaged).
- TopicId - A unique identifier of the last authored topic that was
triggered in this session.
For more information, see Analyze session information .

---


# Check your knowledge

- 4 minutes

## Answer the following questions to see what you've learned.

When a customer initiates an agent conversation, they're automatically asked to provide the nature of their inquiry. They can select from Support, Billing, or Question. You have been asked to configure the agent to automatically escalate the conversation to a live agent when someone indicates that the nature of the inquiry is Billing. What conversation node can you use to facilitate this request?
Call an action.
End the conversation.
Show a message.
Go to another topic.
You're using the Call an action conversation node to initiate a Power Automate flow. What do you call the values that are provided back to Microsoft Copilot Studio from Power Automate flow?
Inputs
Entities
Outputs
Topics
You must answer all questions before checking your work.

---


# Summary

- 1 minute
Because customers are demanding more personalized and efficient customer service experiences, organizations are turning to agents. Agents help provide customers with a self-service support solution that can be interacted with through natural language that simulates a human conversation. Agents can help resolve simple or common issues, allowing agents to focus on more complicated issues that might require more time. With Microsoft Copilot Studio, organizations can create powerful agents through a guided, no-code graphical interface. Additionally, organizations can enhance the agents that they create to make them more versatile and support a larger number of situations.
This module examined how to enhance your Microsoft Copilot Studio agent to expand how it can be used, including:
- Exploring how to incorporate automation with Power Automate flow to help integrate your agent with other technologies and incorporate that data into your agent.
- Examining how to trigger your Copilot agent to hand off a conversation to a live agent who is working in applications such as Omnichannel for Customer Service.
- Exploring how to incorporate generative answers into your agent.
- Explaining the different analysis capabilities that are available, including working with customer satisfaction details and session information.
Your next step would be to explore other applications that can be used with Microsoft Copilot Studio to create robust customer support solutions, including Dynamics 365 Customer Service Insights and Omnichannel for Customer Service.

---

