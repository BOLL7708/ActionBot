# WebSocket Coms

## Communication Flow

```mermaid
sequenceDiagram
    title Connection Lifecycle
    participant S as Server
    participant C as Client
    C ->> S: Connect HTTP, with subprotocols
    activate C
    S ->> C: Upgrade to WebSocket, and register session
    Note over S, C: Example Request + Response
    C ->> S: Send request with NONCE value
    S ->> C: Return response with NONCE value
    Note over S, C: Example Push
    S ->> C: Send data without it being requested
    Note over S, C: Example Subscription
    C ->> S: Send request to subscribe to topic
    S ->> C: Confirm topic subscription
    S ->> C: Send topic initial data
    S ->> C: Send topic event
    C ->> S: Unsubscribe from topic
    S ->> C: Confirm topic unsubscription
    deactivate C
    Note over S, C: Disconnect
```

## Explanation

### Connection Data

When a client connects, it will provide a subprotocol, authentication and optional ID.

* Subprotocol, the type of connection the client establishes: `db`, `presenter`, `dashboard`
* Authentication, some means of shallow authentication, not sure if per subprotocol or singular.
* ID, optional value that identifies this client among other clients using the same subprotocol.

### Send to Client

* Providing the subprotocol will limit broadcasts to clients connected with that subprotocol.
* To differentiate between clients in a group there should be `Preset`-objects associated with them.
    * The ID for this object is what is included in the subprotocol values.
    * When using this ID, messages will only be sent to that client, instead of broadcasting to the whole group.

### Send to Server

* There are no headers or hidden values that are possible to send with a message, so we will only encode a JSON object that will be pre-defined in the shared lib types.

## Messages

### Sent to Presenter

```json
{
  "key": "some-kind-of-identifier",
  "data": "whatever data we need"
}
```