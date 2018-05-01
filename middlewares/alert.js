module.exports = function (req, res, next)
{
	if (req.session.alert)
	{
		res.locals.alert = req.session.alert;
		req.session.alert = undefined;
	}

	req.alert = function (type, content)
	{
		if (req.session.alert === undefined)
		{
			req.session.alert = {};
		}
		req.session.alert[type] = content;
	}	
	next();
};