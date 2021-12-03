# Rocket_Elevators_GraphQL

Implemented using Node.js and Express to deploy this GraphQL API on Heroku. Here is the website https://rocket-elevators-graph.herokuapp.com/graphql

GraphQL API Team:
Matthew Dandurand
Do Minh An Nguyen
Jacob Gomez

Question 1:
Retrieving the address of the building, the beginning and the end of the intervention for a specific intervention.
Query 1:

```

{
  intervention(id: 1) {
    id
  	intervention_start_time
    intervention_end_time
    status
    building {
      address {
        number_and_street
        suite_and_apartment
        city
        postal_code
        country
      }
    }
  }
}
```

Question 2:
Retrieving customer information and the list of interventions that took place for a specific building
Query 2:

```
{
  building(id:1) {
    customer {
      company_name
      company_contact_name
   	  contact_email
      company_description
      service_tech_name
      service_tech_phone
      service_tech_email
      address_id
    }
    interventions {
      id
      status
      intervention_start_time
      intervention_end_time
    }
  } 
}


```

Question 3:
Retrieval of all interventions carried out by a specified employee with the buildings associated with these interventions including the details (Table BuildingDetails) associated with these buildings.
Query 3:

```
{
	employee(id:2) {
    batteries {
      id
      building {
        id
        interventions {
          id
          status
          
        }
        
        buildingDetails {
          information_key
          value
        }
      }
    }
  }
}


```
