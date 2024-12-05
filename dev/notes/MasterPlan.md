# Project Structure
```mermaid
flowchart LR
    root[Root Folder] --> bot & lib & web
    bot[Bot Backend] --> connections[Service Connections] & code[Code]
    code --> trigger & action & callback
    lib[Shared Lib] --> objects --> config[Config] & preset[Preset] & event[Event] & trigger[Trigger] & action[Action] & setting[Setting] & callback[Callback]  
    web[Browser Components] --> setup[Initial Setup] & editor[JSON Editor] & dashboard[Dashboard] & presenter[Presenter] & search[Search] & defaults[Import Defaults]
    editor --> browsing[Browsing] & editing[Editing] & testing[Test Actions]
    setup --> config1[Configuration] & auth[Authenticate Twitch]
```
---

- one
- twp


# Coding Plan
## Keep
1. Database structure
2. Database handler
3. Objects (actions, triggers, configs, options)
4. API Connections
   * Steam
   * SSSVR
   * OpenVR2WS
   * Pipe
5. Action handling
6. Editor data modification functions

## Refurbish
1. AudioPlayer - move to Presenter
2. Sign - move to Presenter
 
## Remake
1. Callbacks
   * Remake how user data is propagated from: trigger --> action --> callback
     * What this means, is that we should change where we retrieve additional data.
   * Switch callbacks from hard-coded to customizable entries
2. Editor
   * Vue: Single File Components
   * Vue: Single Page Application

## Implement
1. Third party libraries
   * Twitch
   * OBS
   * Discord
   * Philips Hue / Home Assistant

---

# New Data Flow
1. Callbacks are now customizable, repeatable, referencable, just like actions.  
2. A callback when complete can trigger actions in turn.  
3. Because triggers run actions that can run other actions through the System action or Callbacks,  
we should propagate a list of previous actions, and prevent execution of previously executed actions.

## Callback Payload
Callbacks will have to use a commonly shaped payload. This should include properties for:
1. Event Data
   * User (Twitch ID, name, nick, color, avatar, url...)
   * Trigger
   * Action
2. Image
   * Screenshot 
3. Sound
   * Sound FX
   * Text-to-speech
4. Texts
   * Title
   * Subtitle
5. Session Data
   * Game info
   * Stream uptime etc?
```mermaid
flowchart LR
    event[Event] --> trigger[Trigger] & action[Action]
    action --> task1((Task1)) & task2((Task2)) & task3((Task3)) & callback
    task2 -- Task with result --> callback[Callback]
    callback --> task4((Task4)) & task5((Task5)) & task6((Task6))
```

---

# Service Connections
```mermaid
flowchart LR
    services[Service Connections] ==> twitch[Twitch] & OBS & SSSVR & OpenVR2WS & Pipe
    services[Service Connections] --> Discord & PhilipsHue
    services -.-> HomeAssistant
    twitch ==> Chat & EventSub 
    twitch --> Helix
```
---

# Data Types
*(From the original readme)* There are a range of data sources used by the events, triggers and actions. These are described below.
```mermaid
flowchart LR
    Desbot[DESBOT\nThe bot uses these things to function.]
    Desbot --> Config[CONFIG\nCollections of configuration\nvalues used for various integrations.]
    Desbot --> Preset[PRESET\nManually added data that is meant\nto be reused in multiple places.]
    Desbot --> Setting[SETTING\nAutomatically added data that the bot\nmanages, usually no need to access these.]
    Desbot --> Event[EVENT\nContains triggers\nthat trigger actions.]
    Event --> Trigger[TRIGGER\nThese are the things that\ncauses the bot to perform things.]
    Event --> Action[ACTION\nThese are the things that\nthe bot can cause to happen.]
    Action --> Callback[CALLBACK\nHandles responses from services\nand can trigger more actions]
```