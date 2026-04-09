# Manage topics in Microsoft Copilot Studio

**Module slug:** `manage-power-virtual-agents-topics`
**Source:** https://learn.microsoft.com/en-us/training/modules/manage-power-virtual-agents-topics/
**Units:** 8

## Table of Contents

1. Introduction
2. Work with agent topics
3. Branch a topic
4. Create topics for existing support content
5. Work with system fallback topics
6. Manage topics
7. Check your knowledge
8. Summary

---


# Introduction

- 4 minutes
Assisting customers with Intelligent virtual agents, often referred to as
agents, is a major business trend today. Agents are being used to help
ease live agent workloads by handling specific types of calls, help with
customer information gathering, complaint resolution, executing actions,
and helping in other scenarios. Agents help users accomplish specific
tasks by using artificial intelligence to identify the customer's intent
and present content or execute actions related to that intent. For
example, if someone asks what the weather is where they live, an agent
could find out where they live and provide them with a detailed weather
forecast for their area. That agent could also help the customer do things
like check their account balance, book a hotel room, or hand them off to
a live agent that can better assist them. The agent just needs to know
what information to present to the customer based on what they're asking for.
Think of a customer's interaction with a virtual agent just like a
conversation you would have with a person. While each conversation is
different, they all have their main parts:
- Conversation beginning : An event such as answering a phone, a
face-to-face greeting, or engaging in other formats initiates each
conversation.
- Discussion points : These represent the specific items communicated
during the conversation such as the weather, making or formulating
plans, providing life updates, asking questions and so on.
- Conversation ending : The conversation ends with an event such as
hanging up the phone, shaking someone's hand, driving away, or some
other action.
Conversations are different because what you say or what you do is based
on feedback you're getting from the person you're interacting with. For
example, if they ask you about your new job, you're going to tell them
about your job, not about a vacation you just took. Agents need to be able
to work the same way. They need to deliver the correct details and take
appropriate action based on what the customer is saying.
Microsoft Copilot Studioâs agents do this through topics. Think of a topic
as a small individual conversation on a specific subject. Multiple topics
can be used together in a single agent to provide the customer with an
automated conversation that feels natural and flows appropriately.
For example, a single agent might contain the following topics:
- Greeting
- Account Inquiry
- Weather Inquiry
- Find an Answer
- Escalate Conversation
- End Conversation
Each of the above topics would have trigger phrases that help the agent
identify when to present that topic to a customer. If the customer asks,
"What is the weather," the weather topic is launched. If they state, "I
have an account question," the account inquiry topic is launched. By
defining multiple topics within a single agent, organizations can create
flexible virtual agents that can be used to engage and interact with
customers on a wide variety of individual topics.
Throughout this module, we examine how to use topics to create and manage
conversation paths in an agent.

---


# Work with agent topics

- 25 minutes
In Microsoft Copilot Studio, Topics represent paths a customer can be
taken on while interacting with an agent. The topic used, and the path
followed within an individual topic, is in response to the data typed in
by customers in the conversation panel. Topics are the primary element
that dictates how conversations flow. If a customer asks about the
weather, the agent can launch a weather topic. To provide them with the
correct weather forecast, the agent can ask questions defined in the
topic, such as what city they live in. The agent retains that information
so it can be sent to a weather service for forecast details. The forecast
can be returned to the customer in a personalized message that includes
relevant customer information.
Copilot Studio topics consist of two primary elements:
- Trigger phrases : Phrases, keywords, or questions entered by users that
relate to a specific issue.
- Conversation nodes : Define how an agent should respond and what it
should do.
As the customer enters information, the agent's Artificial Intelligence
uses natural language understanding to parse what they're typing and find
the most appropriate trigger phrase or node. If a user enters "I need to
return a defective product" into your agent, parts of the text such as
"return" or "defective product" could be matched to return a topic that
includes those items as trigger phrases.
Once loaded, different conversation nodes in the topic are used to control
and define the path the customer takes during the conversation. Messages
presented can provide details or instructions. Questions can be asked to
identify the type of product they want to return. Actions can be used to
help them create a custom return label that could be sent to them to
facilitate the return.

## Work with topic triggers

The first thing you need to define in a topic is what phrases the agent
should look for, which triggers the topic. Trigger phrases are added by
selecting Edit next to Phrases . A single topic can have multiple
trigger phrases defined for it. Having five to 10 trigger phrases is a
good starting point but you can add as many as needed. Punctuation can be
used in trigger phrases. However, it's best to use short phrases rather
than long sentences. Try to think about how a customer might phrase their
request. If the topic is used to communicate store hours, your triggers
should relate to being open or closed, time frames, dates, etc. Using
phrases like "What are your hours," "When do you open," "Store Hours," and
"Hours of Operation" would be good starting phrases. More trigger phrases
can be added over time as you identify other ones that would be needed.
You should also try to make your trigger phrases as unique to the
individual topic as possible. This maximizes the likelihood the agent
launches the correct topic as the user types what they need. For example,
an agent might contain two topics. One called "Product Returns" and
another called "Product Recalls." It wouldn't be uncommon for each topic
to have similar verbiage. If you add 'defective product' as a phrase to
the agent, the application might not understand which topic to load.
One way to handle this would be to add more specific trigger phrases to
the topics, such as using 'return defective product' in the "Product
Returns" topic and 'return recalled product' in the "Product Recalls"
topic.
Another approach could be that you only create one topic that is used for
agent returns and recalls. When the agent initiates the topic, additional
information could be gathered and used to guide them down a return or
recall path. This becomes increasingly important in scenarios where an
agent contains many individual topics. Remember, a single agent can have
up to a maximum of 1,000 topics in it. Some simple planning early in the
process can prevent frustration in the future.

## Add an event trigger

Topics can also be triggered by events in the form of an Event received trigger. These events can range widely from a row added to a Dataverse table to an agent's variable being set above a specific value. If you have experience with Power Automate, these topics resemble a Power Automate automated cloud flow and are triggered when specific conditions are met that can either be internal to the agent or external in the form of a connector.
When your agent is set to Classic Orchestration mode, the default Event received trigger can be added to any topic by selecting the Change trigger button in the trigger node and choosing Event received from the list of triggers. Through this process, you can manually set the topic to trigger when a specific variable condition is met. For example, if a user responded that they live in the United States, the agent may provide offerings only available to those that live in the United States automatically, while continuing the original topic conversation path. Testing the trigger can be done by navigating a conversation in the test pane so that the desired variable condition is expressed.
When your agent has Generative Orchestration enabled, you can add your own custom event triggers with the help of common triggers used in Power Automate automated cloud flows like:
- When an item is created in Sharepoint
- When a new email arrives in Outlook
- When a file is created in OneDrive
- When a row is added, modified, or deleted in a Dataverse table
After choosing the trigger connector you'd like to have, selecting Continue allows Copilot Studio to retrieve the connections associated with the logged-in tenant and user. These are typically a connection to Copilot Studio and the associated service.
After confirming the connections, supply the associated information required for the connector you chose. For the When an item is created in SharePoint trigger, this would be the Site Address , List Name , (optional) Limit Columns by View , and additional instructions to the agent.
Selecting Create trigger saves the entered information and add the trigger to your agent under the Triggers section of your agent's Overview page.
Test the trigger by selecting the Test trigger icon next to the trigger from the Triggers list. Once the test is initialized, perform the triggered action, then the run for that action displays along with the date and time of the test. With the event selected, select the Start testing button, and you are navigated to a conversation map with test information depending on the instructions provided to the agent and the connector used.

## Use conversation nodes to design the topic's conversation path

Once you define how the topic is triggered, you need to design the flow of
the topic as users interact with it. This is called a conversation path. A
topics conversation path defines how the customer is interacted with, and
what occurs based on customer input. You can edit a topic conversation
path by closing the trigger phrases pane. At any point, you can return to
the trigger phrase pane by selecting the Edit pencil on the Trigger
node.
When a new topic is created, it includes a trigger phrase node. More nodes
can be added by selecting the plus (+) icon on the line or branch between
or after a node.

## Work with conversation nodes

Conversation nodes represent customer interactions or actions that can be
inserted into a topic's conversation path. They might be used to display a
message to the customer, ask them for some additional information, trigger
an automation, or trigger an escalation to a live agent.
There are several different node types available:
- Send a message : Displays a message to the user. Messages can
include some basic formatting and numbering.
- Ask a question : Helps the agent capture information from the user.
The captured information can be used to influence the flow of the
conversation, or as variables in other parts of the agent.
- Ask with adaptive card : Enables you to add snippets of content to
Microsoft Copilot Studio agents that can also be openly exchanged with
other cloud apps and services.
- Add a condition: Allows you to add a condition to the topic flow.
This can be used to direct users down specific paths based on if the
condition is met or not.
- Variable management : Allows you to perform different actions on
variables in the agent including setting variable values and removing them.
- Topic management : Directs the user to a different topic in the
agent, ends the conversation, skips to a specific topic step, or
transfers the conversation to a live agent. For example, you might
want to send the user to a specific topic about the closure of a store
if they ask about store hours for that store.
- Call an action : Calls a Power Automate Flow or generative action
to help interact with external systems or areas. For example, passing
customer location details to the MSN weather connector to get the
local weather forecast for the customer's location.
- Advanced : Provides advanced conversation nodes like generative
answers, HTTP requests, logging events, sending events, sending
activity, or authentication nodes.
Depending on the type of node you select, it might have different options
that can be defined.

## Work with the question node

Question nodes are often used in conversation paths. They help capture
additional information from customers. Information captured from the
question can be stored and used in other parts of the agent or in
automation. They can also affect the path the customer is taken on. For
example, you might use a question node to capture the city a customer
lives in. You could also use a question node to provide the customer with
a list of multiple-choice options to choose from, such as a list of cities.
Each question node contains three base fields:
- Ask a question : The question text that you want to present to the user.
- Identify : Defines what the agent should be listening for in the
user's response. For example, multiple choice options, a number, or a
specific string.
- Save user response as : Defines how you want to save the data
captured from the questions so it can be used as a variable later.
There are multiple predefined options that you can choose from in the Identify field. These options can not only make the experience of
interacting with the agent easier, but they also make it easier for the
agent to extract the correct information from the user's response.
One way this can be done is through what are referred to as entities. An
entity can be viewed as an information unit that represents a certain type
of a real-world subject, like a phone number, zip code, city, or even a
person's name. For example, setting the Identify field to City would
extract only city information from the user's response. If the user
entered something like I live in Seattle, it understands that Seattle is a
city. If someone entered, I love NYC, it understands that NYC is an
abbreviation for New York City and would store the response of NYC. There
are several options like this example such as Email, Date and Time, Person
name, Phone Number, and more.
Depending on what you select for the Identify field, other field
options might be presented to help provide more details for the item. For
example, setting the Identify field to "Multiple choice options,"
displays "Options for user." Here, you can define the options that you
want to present to the user. Each option would be presented in the
conversation window as a multiple-choice button.
Another advantage to the question node is separate conversation paths can
be used based on the customer's response. We'll look at branching in
the next unit. Branching helps lead to the appropriate resolution for each
user response.

## Configure question behavior

Another aspect of creating questions is defining question behavior
properties. These properties provide you with more detailed control over
different aspects of the Question node, such as how the agent handles an
invalid response or how it validates user input. For example, when
creating a reservation question, you might want to limit the number of
people they can request the reservation for. With question behaviors, you
can define what that number is, and specify what to do when that number is
exceeded.
You access question behavior properties directly from the Question node.
There are multiple items that you can define while working with the
question properties:
- Skip behavior : Defines what the agent should do if the variable
associated with the question node already has a value from earlier in
the conversation such as being captured in a previous question. There
are two options here you can choose from: Allow question to be skipped : Skip the question if the
variable has a value. Ask every time : Ask the question even if the variable has a
value.
Skip behavior : Defines what the agent should do if the variable
associated with the question node already has a value from earlier in
the conversation such as being captured in a previous question. There
are two options here you can choose from:
- Allow question to be skipped : Skip the question if the
variable has a value.
- Ask every time : Ask the question even if the variable has a
value.
- Retry prompt : Defines how the agent should react if it doesn't get
a valid answer from the user. You can tell it to try again once,
twice, or move on without getting an answer. You can also create a
custom message.
- Advanced message settings: Allows you to define additional
settings on the message that is sent. You can modify the following
options: Value: Contains parameters specific to the activity to be
handled by the client. Channel data: Contains parameters specific to the channel to be
handled by the client.
Advanced message settings: Allows you to define additional
settings on the message that is sent. You can modify the following
options:
- Value: Contains parameters specific to the activity to be
handled by the client.
- Channel data: Contains parameters specific to the channel to be
handled by the client.

## Display messages with the show a message node

Message nodes are used anytime you want to provide some details or
information back to the user. Messages are simple text messages, but they
can also include richer components, such as images, videos, quick replies,
and cards as needed.

## Use message variations

To provide a more conversational experience to your users, you can specify
different message variations. For example, you might add the variations
"Sure. I can help you with that", and "I'm happy to help you with that."
When you add message variations, the agent randomly picks one of them to
use each time the node is triggered.

## Add an image

Images and videos can provide a great way to create a more enhanced and
useful experience. For example, if you're creating an agent that helps
with troubleshooting, you can use the image to display a picture of the
item they're troubleshooting, or you can link to a video that provides
help.
When defining an image, you need to provide:
- The URL of your image in the image field.
- A Title for the image.
When defining a video, you need to define:
- Title : Specifies the title of your video.
- Subtitle : Provides more context about what the video is about.
- Image URL : Provide a URL to a publicly accessible image file that can be
used as a thumbnail for your video.
- Media URL : Provide the URL of your video. The URL can either be a direct
link to a publicly accessible MP4 file or a YouTube URL.
- Text : Allows you to enter any other text you want associated with the
video.
- Buttons : Allows you to add buttons for interacting with the control.

## Add a basic card

A basic card is a general-purpose card that you can use to add text,
images, and interactive elements to agent responses.
When adding a basic card, you can define these values:
- Image URL : Provide a URL to a publicly accessible image file that can be
used as a thumbnail for your card.
- Text : Allows you to enter any other text you want associated with the
card.

## Add an Adaptive Card

Unlike basic cards that are static in the details that they present,
Adaptive Cards are platform-agnostic cards that you can tailor to your
needs. When delivered to a specific app, the JSON is transformed into
native UI that automatically adapts to its surroundings. For example, you
could create a weather card that includes graphics and animations that
display forecasts in more detail.
Cards can be designed using the Adaptive Cards Designer or author the JSON
directly. For more information using the Adaptive card designer, see: Adaptive card designer.
When you design an adaptive card, under Edit JSON , enter the JSON for
your card. If you need more room, you can open a larger view of the JSON
editor, by selecting the Expand icon.
To learn more about working with adaptive cards, see: Add an Adaptive Card.

## View multiple cards in the same node

Sometimes you might run into a scenario where you need to have multiple
cards displayed in the same node. For example, you might have multiple
images that need to be presented to the user. When you add two or more
cards to a node, you have two different display options that you can
choose from for presenting the data.
- Carousel : Displays one card at a time, and users can cycle through them.
- List : Displays all cards in a vertical list.

## Use quick replies

When designing an agent, it's not only important to make the experience as
simple as possible. It's also important to ensure that the agent can
easily identify what the user is doing and take the appropriate action.
One way you can accomplish this in Microsoft Copilot Studio, is with Quick
replies. Quick replies provide suggested responses or actions for the
user. When a user selects a quick reply, it sends a message back to the
agent. The quick reply text is shown in the chat history as if the user
typed the message. The quick reply buttons are removed from the chat
history when the agent or user sends another activity.
Users can choose to use a quick reply or ignore it. To require the user to
choose an option from a list, use a multiple-choice Question node instead.
To learn more about working with Quick Replies, see: Use quick replies.
Message nodes can also include variables in message content. Variables can
be used to store information captured from a question. Inserting a
variable allows you to provide more personalized messages. For example,
you could use a question node to capture the city that an individual lives
in. The answer to the questions is stored in a variable used later in a
message to the customer such as "currently the weather in "city" is...
You can learn more about variables here: Use variables

## Work with the topic management node

Each topic that you include in your agent is likely going to be specific.
For example, a "current weather" topic is only going to provide weather
related data, and an "hours of operation" topic is going to focus on when
a business is open. Just because they're separate topics doesn't mean that
they can't be related or dependent on each other. For example, let's go
back to our "Product Returns" and "Product Recalls" example from earlier.
Rather than coming up with multiple unique triggers for agent topics, we
could create a "Recall or Return" topic. The purpose of the topic would be
to determine which topic to load next. It contains a question node that
asks if this is a return or recall. Based on what the user selects, the go
to topic node loads either the "Product Returns" or "Product Recalls"
topic.

## End the conversation

Many times, the end of a topic also represents the end of the
conversation. The end the conversation node signifies the end of the
entire conversation and provides actions that can be initiated. You can
have a survey appear that asks the user if their question or issue was
answered or resolved correctly. This information is collected under the customer satisfaction analytics page . You could also elect to escalate the
conversation over to a live agent if you're using a suitable customer
service portal, such as Omnichannel for Customer Service. At the end of a
response that resolves the user's issue or answers the question, select
End the conversation.

## Use the call an action node

One of the many advantages to Microsoft Copilot Studio, is the ability to
execute actions such as sending emails, locate external data, or create
activities based on data entered in the agent. The call an action node
helps to facilitate this by allowing you to call a Power Automate Flow
from the agent.
For more information on calling a Power Automate Flow from a topic, see Key concepts - Use Power Automate flows in Microsoft Copilot Studio .

---


# Branch a topic

- 2 minutes
Adding branching into to topic is what truly turns them from a one-way
path to a multi-layer conversation. Different forks and paths ensure the
customer is provided data and resolutions based on the current situation.
Branching allows you to evaluate conditions to initiate conversation nodes
to launch another topic, display a message node, or trigger a Power
Automate Flow. You can manually add branching conditions between nodes,
such as inserting a branch after you ask a question such as "What country
do you live in?" The customer's response to the question is stored as a
variable, and branch conditions can be built based on that. This is done
by selecting + to add a node, and then selecting Add a condition and selecting the Branch based on a condition option.
You select how the agent conversation should branch at this point. For example, if you have set up end-user authentication , then you might want to specify a different message if the user is signed on (which might have happened earlier in the conversation).
Depending on what you select in the Identify field of the question node,
branching might occur automatically. This is always the case when you
select Multiple Choice options. Each option has a branch created for it.
For example, if you have a question node that asks a customer for their
preferred store location and provides them with "Seattle" and "Bellevue"
as options, a condition branch for each option is created. You need to
ensure that you're providing a completed path resolution for both items.

---


# Create topics for existing support content

- 6 minutes
Many organizations want to create agent topics that use existing content. This can provide them with several advantages from the time saved in authoring the topic, to ensuring that topics are aligned with the types of issues that are being reported. One good example of this is for organizations that are using Dynamics 365 Customer Service Insights .
Customer Service Insights uses artificial intelligence to automatically group your organization's cases into topics. Since topics are already defined based on your organization's caseload, it would make sense to align the topics in a customer support agent with those topics.
Microsoft Copilot Studio uses Artificial Intelligence (AI)-assisted authoring to help organizations automatically extract and insert relevant content from existing web content topics into your agent. This eliminates the need to copy and paste or manually recreate content into topics.
The Artificial Intelligence evaluates the page and determines both the structure and content. It isolates content blocks that relate to a support issue or question and classifies them into topics. Each topic identified follows the same structure as other topics. They contain trigger phrases identified during the process, and an initial Message node . These topics appear as suggested topics that can be modified and deleted like other topics.
There are three main steps involved with autocreating topics:
- Extract content from existing FAQ or support pages.
- Add the suggested topics to your agent.
- Enable the topics in your agent.
Note
The following examples are only capable in the Microsoft Copilot Studio
for Teams application. Suggested topics are not a current feature in the
Microsoft Copilot Studio web app.

## Extract content from webpages

The first step in creating topics from existing content is to extract topic suggestions from existing pages you want to use that contain support content. This is done by using the Suggest topics command in Microsoft Copilot Studio. The Suggest topics command is built to run on webpages that are in the form of FAQ pages or support sites. After the extraction is complete, the suggested topics are displayed for you to review further.
Content can be extracted by selecting the Suggest topics button on the Topics page. When you're first getting suggestions, this page is likely blank. Once topics have been extracted, the list is displayed. To suggest topics, you need to enter a URL for each webpage you want to extract content from. The URLs must be secure (they must start with https:// ). If you add a page by mistake, you can remove it by selecting Delete.
Depending on the complexity of the pages and the number of pages you add, it can take some time to extract the content. The message "Getting your suggestions, this may take several minutes" appears at the top of the screen while the extraction is in progress. If any errors are encountered during this process, the tool provides explicit feedback about errors so that you can understand and address the issue. For example, you might be unable to extract content because the site you're referencing is down. Once the content has been extracted, suggestions appear that you can review and decide if they should be added to your agent.

## Add suggested topics to an existing agent

Extracted topics aren't automatically added as topics in your agent. After the extraction process has been completed, any topic suggestions appears on the Suggested tab. This allows you to review them and determine if they're topics that you want to have included in your agent. You can also review the trigger phrases and message nodes that were created and make any edits that you want.
There are three options for dealing with the topic.
- Add to topics and edit : Opens the topic so you can edit the trigger phrases or enter the authoring canvas to make changes to the conversation flow. Once completed, the topic is removed from the list of suggestions.
- Add to topics : Topic is automatically added to the list of topics and removed from the list of suggested topics.
- Delete suggestion : Doesn't add to your list of topics and deletes the topic from the suggested topics.

## Enable topics in your agent

Once a suggested topic is added to the Existing tab, the status set to Off. This makes sure that it isn't prematurely added to your agent before you've had time to make the necessary changes to it, such as modifying trigger phrases or adding more conversation nodes to enhance the topic as required. When a topic is ready to be used, set the Status to On.

---


# Work with system fallback topics

- 4 minutes
As an agent engages with customers, it triggers the most appropriate topic
based on the user's input. From time to time the agent might not be able
to determine the user's intent based on what they type. When this happens,
it prompts the user again. After two unsuccessful prompts, the agent
escalates the conversation to a live agent using the Escalate system
topic.
Some organizations might not want to have all scenarios where a topic
isn't triggered become escalated. For example, you might want to create a
catchall topic that is used whenever the agent is unable to recognize the
intent. Once routed to this topic, it can try to better pinpoint what the
customer is looking for by asking them questions, providing category
options, or other types of interactions with the customer. When you want
to defer to a topic rather than triggering an escalation, you can use a
Fallback topic.
By default, when you create a new agent, a system fallback topic is
automatically added. You can access the fallback topic by going to Topics and selecting the System tab.

## Customize the system fallback topic

Unlike other topics, the fallback topic doesn't have a trigger phrase,
known as an On Unknown Intent trigger. Unrecognized user input is what
triggers the topic.
The fallback topic contains the following nodes:
- Condition: Used to determine if the user needs to be redirected.
- Message : Acknowledges the unrecognized input and rephrases it
- Escalate : Redirects to the Escalate topic.
As with any other system topic, the fallback topic can be customized to
fit your needs. For example, you present the user with a question such as
"what are you looking for assistance with?" The customer could be
presented with options such as "Sales," "Service," or "General." Based on
what they select they could be redirected to a topic that related to that
selection, execute a Power Automate Flow, send an email, or if needed
escalate them to an agent. The initial unrecognized text entered by the
user is stored in a variable called UnrecognizedTriggerPhrase variable.
You can use the information stored here to further personalize the experience. For example, you can pass it as input to a Power Automate flow or agent Framework skill .

## Reset a system fallback topic

If you find that the system fallback behavior isn't what you are looking
for, you can reset it. Resetting it returns it to its default behavior.
Using Topics , navigate back to the System tab, open the Fallback topic, select more options and select Reset to Default.

---


# Manage topics

- 6 minutes
As the number of topics in your agent grows, it becomes more important be
able to effectively manage them. This includes understanding which topics
are active and can be used by the agent, and which ones are still being
worked on. Topic management also includes identifying errors that could
affect a topic's ability to be used. To help you to effectively manage
topics, Microsoft Copilot Studio provides multiple features that help
ensure topics are working as intended, and only visible to end users after
they're tested and are ready.

## Manage topic status

Each topic has a status that indicates if the topic can be used in
conversation. Non system topics can either be on or off. System topics
such as the Greeting, Goodbye, and Escalate topics are on by default, but
can be turned off. When a topic is on, it triggers as expected. This could
be the result of its trigger phrases or from being redirected to it from
another topic. Most topics are in the on state. All topics are set to on
when they're created.
Topics that are off don't trigger at all. Off topics' trigger phrases
don't work, and they aren't redirected to, even if another topic specifies
it. The topic is treated as if it doesn't exist. In most scenarios, a
topic is set to off while being worked on until it's ready to go live.
When an agent is published, every topic, regardless of whether it's set to
on or off, is published. However, any topics that are set to off aren't
triggered.

## Work with topic errors

Microsoft Copilot Studioâs Topic Checker validates your topic and shows
any errors or warnings. Errors or warnings can occur for any number of
reasons. Warnings indicate that something isn't ideal, but it doesn't
prevent the agent from functioning. Since warnings don't prevent the agent
from functioning, they're ignored while processing. Errors on the other
hand need be addressed to avoid unexpected behavior or failure during the
chat experience. Errors might occur if a node in your topic is incomplete.
For example, not providing a message in a message node, or authentication
issues with a Power Automate flow that is being launched in an action are
agent examples that would cause errors. The Topic Checker provides details
related to the warning or error to make it easier to resolve the issue.
There are four types of errors that appear in the topic checker and in the
authoring canvas:
- Node : The entire node is erroneous and is highlighted red.
- Field : The field might be missing required data and is highlighted red.
- Expression : The expression might be invalid and is highlighted red.
- Variable deletion : A variable in a topic was deleted and is
highlighted red wherever it was used. This causes the variable to
become "orphaned," and it must either be removed or replaced.
You can also see the error state of a topic on the Topics list page by
clicking on the Topics tab. The Errors column indicates the number of
errors found during validation. This only indicates errors and doesn't
include warnings, since they don't prevent the agent from functioning. As
you fix the errors, they'll disappear from the topic checker, either
automatically or after saving the topic. Topics with errors can be saved,
however, the errors persist until they're addressed. You can't deploy a
topic containing errors to production.

## Copy a topic

Once you create a few topics, you might want to use a previous topic as a
baseline when creating new topics. Copying topics saves time when a
conversation path is already defined. You just need to modify the trigger
phrases, and tailor the conversation path to fit your need. On the topic
list page, hover on a topic, select the menu icon, and then Make a copy.
This creates a duplicate of the selected topic with (Copy) appended to
the name. All topic content, such as the description, trigger phrases, and
the entire conversation, is copied over to the new topic.
When making a copy of a topic, you'll be navigated to the authoring canvas
for that copy. Once you finish editing the new topic, you can save the new
topic and it will show up in your list of topics and you'll be able to
test it in the Test your agent pane.

---


# Check your knowledge

- 6 minutes

## Answer the following questions to see what you've learned.

You recently created a new agent that is used to help in customer support scenarios. You have several topics that were created by default that you want to disable. Which of the following topic types can be turned off?
User Topics
System Topics
Lesson Topics
All of the above
You're creating a topic that provides the local weather forecast to a customer. Which conversation node would you use to launch a Power Automate flow to get forecast details from a weather service?
Ask a question
Go to another topic
Call an action
End the conversation
Currently, when your agent is unable to identify which topic to present to a customer, it automatically escalates the conversation to a live agent. You've been asked to configure the agent to first ask the customer a few questions to determine if a topic can help before escalating the conversation. How is this done?
Enable and configure the fallback topic
Enable and configure the escalate topic
Enable and configure the routing topic
Enable and configure entities
You must answer all questions before checking your work.

---


# Summary

- 2 minutes
The primary advantage of an agent is that they provide a personalized natural language conversation with the customer just as an agent maker would. This allows agents to handle common issues and frees up agents to focus on more complex issues. As they identify the intent of what the customer is saying, they can pivot and load content that is most relevant to them. Microsoft Copilot Studio uses topics to provide this content. By modifying a topic's conversation path, organizations can ensure that each customer is provided with a personalized and relevant experience. Information supplied by the customer throughout the conversation can be stored and used later as needed. Existing support content can be added as available topics.
We examined how organizations can create and manage agent topics to provide tailored conversations to customers including:
- Examining how topics are used in Microsoft Copilot Studio to define how conversations between the agent and customer flow.
- Reviewing the process to create topics and how to use the different conversation nodes to control and define different directions the customer can go down.
- Explaining how system topics are used by agents.
- Examining how the system can suggest topics automatically based on existing documents such as knowledge articles or frequently asked questions.
- Explaining when and how you might use a system fallback topic to customize how your agent handles scenarios where it doesn't recognize content.
- Reviewing the different options available for managing the different topics in your application.
From here, your next step would be to gain a deeper understanding on what tools are available to further enhance Microsoft Copilot Studios agent capabilities. This would include items such as how to use Power Automate Flows, trigger hand offs to live agents, and deploy to different channels.

---

