import { Router } from 'express';
import boom from 'express-boom';

export default ({ config, db }) => {
	let routes = Router();

	// add middleware here
	routes.use(boom())

	return routes;
}
