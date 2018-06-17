import resource from 'resource-router-middleware';
import fs from 'fs';
//import customers from '../../data/customers.json';

const NOT_FOUND_ERROR_MSG = 'Customer not found.';
const CUSTOMERS_FILE_PATH = './customers.json';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'customer',

	/** For requests with an `id`, you can auto-load the entity.
	 *  Errors terminate the request, success sets `req[id] = data`.
	 */
	load(req, id, callback) {
        const {data, error} = getCustomerData();
        if(!error) {
            customer = data;
        } else {
            err = error
        }
		let customer = data.find( a => a.id == id ),
            err = customer ? null : NOT_FOUND_ERROR_MSG;
        if(customer) customer.id = id;
		callback(err, customer);
	},

	/** GET / - List all entities */
	index({ params, query: { term } }, res) {
        let customers = []
        const { data, error } = getCustomerData();
        if(!error) {
            customers = data;
        } else {
            return res.boom.badRequest( error )
        }
        if (term) {
            customers = customers.filter( a => ( a.name.includes(term) || a.email.includes(term)))
        }
        return customers.length > 0 ? res.json(customers) : res.boom.notFound( NOT_FOUND_ERROR_MSG )
    },
    
	/** PUT /:id - Update a given entity */
	update({ customer, body }, res) {
        const { data, error } = getCustomerData()

        if(body.hasOwnProperty('email') && !body.email) {
            return res.boom.badRequest( 'Email can not be empty' );
        } else if (body.hasOwnProperty('email')) {
            if(duplicateEmail(data, customer.id, body.email)) {
                return res.boom.badRequest( 'Email already being used.' )
            }
    
            if(!validateEmail(body.email)) {
                return res.boom.badRequest( 'Email invalid.' )
            }
        }
        
        if(body.hasOwnProperty('name') && !body.name) {
            return res.boom.badRequest( 'Name can not be empty' );
        }

		for (let key in body) {
			if (key!=='id') {
				customer[key] = body[key];
			}
        }
        data[customer.id-1] = customer;
        try {
            fs.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(data))
            return res.sendStatus(204)
        } catch ( err ) {
            return res.boom.badRequest('Error writing to the file.');
        }
	},

	/** DELETE /:id - Delete a given entity */
	delete({ facet }, res) {
		facets.splice(facets.indexOf(facet), 1);
		res.sendStatus(204);
    }

});

const getCustomerData = () => {
    let customers = {
        error: false,
        data: []
    }
    try {
        customers.data = JSON.parse(fs.readFileSync(CUSTOMERS_FILE_PATH, 'utf8'));
        if(!Array.isArray(customers.data)) {
            throw new Error('Invalid customer data.');
        }
        return customers;
    } catch (err) {
        customers.error = err;
        return customers;
    }
}

const validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const duplicateEmail = (customers, id, email) => {
    for (let a in customers) {
        if(customers[a].id != id && customers[a].email === email) return true;
    };
    return false;
}