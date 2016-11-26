/*globals*/

module.exports = function(data) {
    return {
        getAll(req, res) {
            data.getAllCampaigns()
                .then(campaigns => {
                    res.render('campaigns/all-campaigns', {
                        result: campaigns
                    });
                });
        },
        getById(req, res) {
            data.getCampaignById(req.params.id)
                .then(campaign => {
                    if (campaign === null) {
                        return res.status(404)
                            .redirect('/error');
                    }

                    return res.render('campaigns/campaign-details', {
                        result: campaign
                    });
                });
        },
        getCreateForm(req, res) {
            return res.render('campaigns/create-campaign');
        },
        getByCategory(category) {
            data.findCampaigns(category)
                .then((categories) => {
                    return res.render('campaigns/all-campaigns', {
                        result: categories
                    })
                });
        }
    };
};