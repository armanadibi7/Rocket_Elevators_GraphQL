# Rocket_Elevators_GraphQL

Implemented using Node.js and Express to deploy this GraphQL API on Heroku. Here is the website https://rocket-elevators-graph.herokuapp.com/graphql




Get all the interventions that are In the pending Status.
Query 1:

```

 {
  pending_interventions{
    id
    status
  }
}
```


Update the status of an intervention to InProgress and the DateTime
Query 2:

```
mutation {
  updateInterventionStart(id: 3){
    id
    status
  }
}


```


Update the status of an intervention to a Completed and add the DateTime
Query 3:

```
mutation {
  updateInterventionEnd(id: 3){
    id
    status
  }
}


```
