//Dependencies

var express = require("express");
var { graphqlHTTP } = require("express-graphql");
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
} = require("graphql");
const { GraphQLDateTime } = require("graphql-iso-date");

const PORT = process.env.PORT || 3000;

//SEQUELIZE
const { Sequelize, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize("armanadibi", "codeboxx", "Codeboxx1!", {
  host: "codeboxx.cq6zrczewpu2.us-east-1.rds.amazonaws.com",
  dialect: "mysql",
});

const Employee = sequelize.define("employee", {});

//POSTGRES
const { Client } = require("pg");
const client = new Client({
  host: "codeboxx-postgresql.cq6zrczewpu2.us-east-1.rds.amazonaws.com",
  user: "codeboxx",
  password: "Codeboxx1!",
  database: "dominhannguyen",
});

client.connect(function (error) {
  if (!!error) {
    console.log("Can't connect to PSQL database.");
  } else {
    console.log("Connected to PSQL database.");
  }
});

//MYSQL
var mysql = require("mysql2");
const { json } = require("express");
var connection = mysql.createConnection({
  host: "codeboxx.cq6zrczewpu2.us-east-1.rds.amazonaws.com",
  user: "codeboxx",
  password: "Codeboxx1!",
  database: "armanadibi",
});

let promisePool = connection.promise();
//connection.connect(function (error) {
//   if (!!error) {
//     console.log("Can't connect to mySQL database.");
//   } else {
//     console.log("Connected to mySQL database.");
//   }
// });

//Type creation
const InterventionType = new GraphQLObjectType({
  name: "Intervention",
  description: "This is an intervention",
  fields: () => ({
    id: { type: GraphQLInt },
    building_id: { type: GraphQLString },
    employee_id: { type: GraphQLString },
    battery_id: { type: GraphQLString },
    column_id: { type: GraphQLString },
    elevator_id: { type: GraphQLString },
    intervention_start_time: { type: GraphQLDateTime },
    intervention_end_time: { type: GraphQLDateTime },
    intervention_start: { type: GraphQLDateTime },
    intervention_end: { type: GraphQLDateTime },
    result: { type: GraphQLString },
    report: { type: GraphQLString },
    status: { type: GraphQLString },
    building: {
      type: BuildingType,
      resolve: async (intervention, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM buildings WHERE id = ${intervention.building_id}`
        );
        return rows[0];
      },
    },
  }),
});

const AddressType = new GraphQLObjectType({
  name: "Address",
  description: "This is an address",
  fields: () => ({
    id: { type: GraphQLInt },
    address_type: { type: GraphQLString },
    status: { type: GraphQLString },
    entity: { type: GraphQLString },
    number_and_street: { type: GraphQLString },
    suite_and_apartment: { type: GraphQLString },
    city: { type: GraphQLString },
    postal_code: { type: GraphQLString },
    country: { type: GraphQLString },
    notes: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
  }),
});

const BatteryType = new GraphQLObjectType({
  name: "Battery",
  description: "This is a battery",
  fields: () => ({
    id: { type: GraphQLInt },
    battery_type: { type: GraphQLString },
    status: { type: GraphQLString },
    date_of_commissioning: { type: GraphQLDateTime },
    date_of_last_inspection: { type: GraphQLDateTime },
    certificate_of_operations: { type: GraphQLString },
    information: { type: GraphQLString },
    notes: { type: GraphQLString },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
    building_id: { type: GraphQLInt },
    employee_id: { type: GraphQLInt },
    building: {
      type: BuildingType,
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM buildings WHERE id = ${parent.building_id}`
        );
        
        return rows[0];
      },
    }
  }),
});

const BuildingType = new GraphQLObjectType({
  name: "Building",
  description: "This is a building",
  fields: () => ({
    id: { type: GraphQLInt },
    admin_name: { type: GraphQLString },
    admin_email: { type: GraphQLString },
    admin_phone_numer: { type: GraphQLString },
    tech_full_name: { type: GraphQLString },
    tech_email: { type: GraphQLString },
    tech_phone_number: { type: GraphQLString },
    address_id: { type: GraphQLInt },
    customer_id: { type: GraphQLInt },
    customer: {
      type: CustomerType,
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM customers WHERE id = ${parent.customer_id}`
        );

        return rows[0];
    }},
    address: {
      type: AddressType,
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM addresses WHERE id = ${parent.address_id}`
        );

        return rows[0];
      },
    },
    buildingDetails: {
      type: new GraphQLList(BuildingDetailType) ,
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM building_details WHERE building_id = ${parent.id}`
        );
        
        return rows;
      },
    },
    interventions: {
      type: new GraphQLList(InterventionType) ,
      resolve: async (parent, args) => {
        const res = await client.query(`SELECT * FROM fact_interventions WHERE building_id = ${parent.id}`)
        console.log(res.rows) 
        return res.rows
      },
    },
  }),
});

const BuildingDetailType = new GraphQLObjectType({
  name: "BuildingDetails",
  description: "This is the building details",
  fields: () => ({
    id: { type: GraphQLInt },
    information_key: { type: GraphQLString },
    value: { type: GraphQLString },
    building_id: { type: GraphQLInt },
  }),
});

const CustomerType = new GraphQLObjectType({
  name: "Customer",
  description: "This is a customer",
  fields: () => ({
    id: { type: GraphQLInt },
    company_name: { type: GraphQLString },
    company_contact_name: { type: GraphQLString },
    contact_phone: { type: GraphQLString },
    contact_email: { type: GraphQLString },
    company_description: { type: GraphQLString },
    service_tech_name: { type: GraphQLString },
    service_tech_phone: { type: GraphQLString },
    service_tech_email: { type: GraphQLString },
    address_id: { type: GraphQLInt },
    user_id: { type: GraphQLInt },
  }),
});

const EmployeeType = new GraphQLObjectType({
  name: "Employee",
  description: "This is an employee",
  fields: () => ({
    id: { type: GraphQLInt },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    title: { type: GraphQLString },
    email: { type: GraphQLString },
    //created_at: { type: },
    //updated_at: {type: },
    user_id: { type: GraphQLInt },
    batteries: {
      type: new GraphQLList(BatteryType),
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM batteries WHERE employee_id = ${parent.id}`
        );
        
        return rows;
      },
    }
  }),
});

//Mutation

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    updateInterventionStart: {
      type: InterventionType,
      description: "Update new Intervention Type",
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM interventions WHERE id = ${args.id}`
        );
        const intervention = rows[0]
        intervention.status = 'InProgress'
        intervention.intervention_start = new Date()
        
       
      
        var today = new Date();
        var year = String(today.getFullYear())
        var month = String(today.getMonth() + 1)
        var day = String(today.getDate())
        var today = year + '-' +  month + '-'+ day
       
        await promisePool.query(
          `UPDATE interventions
          SET status = '${intervention.status}', start_date = '${today}'
          WHERE id = ${args.id};
          `
        );

        return intervention
      }
    },
    updateInterventionEnd: {
      type: InterventionType,
      description: "Update new Intervention Type",
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM interventions WHERE id = ${args.id}`
        );
        const intervention = rows[0]
        intervention.status = 'Completed'
        intervention.intervention_end = new Date()
        
       
      
        var today = new Date();
        var year = String(today.getFullYear())
        var month = String(today.getMonth() + 1)
        var day = String(today.getDate())
        var today = year + '-' +  month + '-'+ day
       
        await promisePool.query(
          `UPDATE interventions
          SET status = '${intervention.status}', end_date = '${today}'
          WHERE id = ${args.id};
          `
        );

        return intervention
      }
    }
  })
})

//Queries
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    intervention: {
      type: InterventionType,
      description: "An intervention",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const res = await client.query(
          `SELECT * FROM fact_interventions WHERE id = ${args.id}`
        );
        console.log(res.rows[0]);
        return res.rows[0];
      },
    },
    interventions: {
      type: new GraphQLList(InterventionType),
      description: "List of All Interventions",
      resolve: async (parent, args) => {
        const res = await client.query(`SELECT * FROM fact_interventions`);
        console.log(res.rows);
        return res.rows;
      },
    },
    pending_interventions: {
      type: new GraphQLList(InterventionType),
      description: "List of All Pending Interventions",
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM interventions WHERE end_date IS NULL AND status = 'Pending'`
        );
        console.log(rows)
        return rows;
      },
    },
    addresses: {
      type: new GraphQLList(AddressType),
      description: "List of All Addresses",
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM addresses`
        );
        console.log(rows);
        return rows;
      },
    },
    address: {
      type: AddressType,
      description: "An Address",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM addresses WHERE id = ${args.id}`
        );
        console.log(rows[0]);
        return rows[0];
      },
    },
    building: {
      type: BuildingType,
      description: "A building",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM buildings WHERE id = ${args.id}`
        );
        console.log(rows[0]);
        return rows[0];
      },
    },
    buildings: {
      type: new GraphQLList(BuildingType),
      description: "List of all buildings",
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM buildings`
        );
        console.log(rows);
        return rows;
      },
    },
    buildingDetail: {
      type: BuildingDetailType,
      description: "Building details",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM buildingDetails WHERE id = ${args.id}`
        );
        console.log(rows[0]);
        return rows[0];
      },
    },
    buildingDetails: {
      type: new GraphQLList(BuildingDetailType),
      description: "List of all building details",
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM buildingDetails`
        );
        console.log(rows);
        return rows;
      },
    },
    customer: {
      type: CustomerType,
      description: "A customer",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM customers WHERE id = ${args.id}`
        );
        console.log(rows[0]);
        return rows[0];
      },
    },
    customers: {
      type: new GraphQLList(CustomerType),
      description: "List of all customers",
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM customers`
        );
        console.log(rows);
        return rows;
      },
    },
    employee: {
      type: EmployeeType,
      description: "An employee",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM employees WHERE id = ${args.id}`
        );
        console.log(rows[0]);
        return rows[0];
      },
    },
    employees: {
      type: new GraphQLList(EmployeeType),
      description: "List of all employees",
      resolve: async (parent, args) => {
        const [rows, fields] = await promisePool.query(
          `SELECT * FROM employees`
        );
        console.log(rows);
        return rows;
      },
    },
  }),
});

//Schema creation
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

//Express Server
var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log("Server is running");
});
