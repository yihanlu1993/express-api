//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
import fs from 'fs';

//let mongoose = require("mongoose");
import customers from '../api/customers';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp from 'chai-http';

import app from '../';
let should = chai.should();

const DATA = [
    { "id": 1, "name": "James Bond", "email": "james@bond.com" },
    { "id": 2, "name": "David Jones", "email": "david@jones.com"  },
    { "id": 3, "name": "David Beckham", "email": "david@beckham.com" }
  ]

chai.use(chaiHttp);
//Our parent block
describe('Customers', () => {
    beforeEach((done) => { //Before each test reset the file
        resetData();
        done();
    });

    after(() => { resetData() })
    /*
    * Test the /GET route
    */
    describe('/GET all customer', () => {
        it('it should GET all the customer', (done) => {
        chai.request(app)
            .get('/api/customers')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(3);
                done();
            });
        });
    });

    describe('/GET customers who matche the terms', () => {
        it('it should get 2 customers, named David', (done) => {
            chai.request(app)
                .get('/api/customers/?term=David')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(2);
                    done();
                }) 
        })
    });

    describe('/GET customers who matche the terms', () => {
        it('it should get 3 customers, with emails end up with .com', (done) => {
        chai.request(app)
            .get('/api/customers/?term=com')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(3);
                done();
            }) 
        })
    })

    describe('/GET customers who matche the terms', () => {
        it('it should get 0 customers, with name Yihan', (done) => {
        chai.request(app)
            .get('/api/customers/?term=Yihan')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.error.should.equal('Not Found');
                done();
            }) 
        })
    })

    describe('/PUT update customer', () => {
        it('it should update customer with id = 1 name to Yihan', (done) => {
        const name = 'Yihan'
        chai.request(app)
            .put('/api/customers/1')
            .send({ name })
            .end((err, res) => {
                res.should.have.status(204);
                const updatedCustomer = JSON.parse(fs.readFileSync('./customers.json', 'utf8'));
                updatedCustomer[0].name.should.equal(name)
                done();
            }) 
        })
    })

    describe('/PUT update customer', () => {
        it('it should not update customer with id = 0 name to Nobody', (done) => {
        const name = 'Nobody';
        chai.request(app)
            .put('/api/customers/0')
            .send({ name })
            .end((err, res) => {
                res.should.have.status(404);
                const updatedCustomer = JSON.parse(fs.readFileSync('./customers.json', 'utf8'));
                updatedCustomer.should.deep.equal(DATA)
                done();
            }) 
        })
    })

    describe('/PUT update customer', () => {
        it('it should not update customer with id = 1 name to null', (done) => {
        const name = null;
        chai.request(app)
            .put('/api/customers/1')
            .send({ name })
            .end((err, res) => {
                res.should.have.status(400);
                const updatedCustomer = JSON.parse(fs.readFileSync('./customers.json', 'utf8'));
                updatedCustomer.should.deep.equal(DATA);
                res.body.message.should.equal('Name can not be empty');
                done();
            }) 
        })
    })

    describe('/PUT update customer', () => {
        it('it should not update customer with id = 1 email to invalid@email', (done) => {
        const email = 'invalid@email';
        chai.request(app)
            .put('/api/customers/1')
            .send({ email })
            .end((err, res) => {
                res.should.have.status(400);
                const updatedCustomer = JSON.parse(fs.readFileSync('./customers.json', 'utf8'));
                updatedCustomer.should.deep.equal(DATA);
                res.body.message.should.equal('Email invalid.');
                done();
            }) 
        })
    })

    describe('/PUT update customer', () => {
        it('it should not update customer with id = 1 email to david@beckham.com', (done) => {
        const email = 'david@beckham.com';
        chai.request(app)
            .put('/api/customers/1')
            .send({ email })
            .end((err, res) => {
                res.should.have.status(400);
                const updatedCustomer = JSON.parse(fs.readFileSync('./customers.json', 'utf8'));
                updatedCustomer.should.deep.equal(DATA);
                res.body.message.should.equal('Email already being used.');
                done();
            }) 
        })
    })
});

const resetData = () => {
    try {
        fs.writeFileSync('./customers.json', JSON.stringify(DATA));
    } catch (err) {
        console.log(err);
    }
}