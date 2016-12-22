/*globals*/
'use strict';

module.exports = function ({ grid, data, database }) {
    return {
        getAll(req, res) {
            let pageNumber = 0;
            let pageSize = 5;
            data.getAllCampaigns(pageNumber, pageSize)
                .then(campaigns => {
                    console.log(campaigns);
                    
                    res.status(200).render('campaigns/all-campaigns', {
                        result: {
                            campaigns,
                            search: true
                        }
                    });
                });
        },
        getJson(req, res) {
            var sessionKey = req.headers['x-auth'];
            if (!sessionKey) {
                res.status(400)
                    .json({
                        errCode: 'ERR_INV_AUTH',
                        message: 'Requires authentication'
                    });
                return;
            }
            let pageNumber = +req.query.pageNumber || 0;
            let pageSize = +req.query.pageSize || 5;
            let category = req.query.category;
            if (category) {
                data.getAllCampaigns(pageNumber, pageSize)
                    .then(campaigns => {
                        res.status(200).send(campaigns);
                    });
            } else {
                data.findCampaignsByCategory(category, pageNumber, pageSize)
                    .then(campaigns => {
                        res.status(200).send(campaigns);
                    });
            }
        },
        getById(req, res) {
            const defaultCommentsCount = 5;
            const startPage = 0;

            data.getCampaignById(req.params.id)
                .then(campaign => {
                    if (campaign === null) {
                        return res.status(404)
                            .redirect('/home/error');
                    }

                    let pagedComments = campaign.comments
                        .splice(startPage, defaultCommentsCount);


                    campaign['loggedUser'] = {};
                    if (req.user) {
                        campaign.loggedUser['loggedIn'] = true;
                        if (campaign.likedBy.indexOf(req.user.username) >= 0) {
                            campaign.loggedUser['alredayLiked'] = true;
                        }
                    } else {
                        campaign.loggedUser['loggedIn'] = false;
                    }

                    return res.status(200).render('campaigns/campaign-details', {
                        campaign,
                        pagedComments
                    });
                });
        },
        getCreateForm(req, res) {
            return res.status(200).render('campaigns/create-campaign');
        },
        create(req, res) {
            let title = req.body.title;
            let description = req.body.description;
            let createdOn = new Date();
            let comments = [];
            let creator = {
                username: req.user.username,
                id: req.user.id
            };
            let donators = [];
            let upVotes = 0;
            let target = req.body.target;
            let funded = 0;
            let category = req.body.category;

            let gfs = grid(database.connection.db, database.mongo);

            let file = req.file;
            if (file) {
                file.buffer = req.file.buffer;
            } else {
                file = { buffer: '' };
            }

            gfs.writeFile({}, file.buffer, (_, foundFile) => {
                let image = '58446edc1756cd0a5c6b2eaa';
                if (file.buffer) {
                    image = foundFile._id;
                }

                let campaign = {
                    title,
                    description,
                    createdOn,
                    comments,
                    creator,
                    donators,
                    upVotes,
                    target,
                    funded,
                    image,
                    category
                };
                data.createCampaign(campaign)
                    .then(() => {
                        res.redirect('/campaigns');
                    });
            });
        },
        getByCategory(req, res) {
            let category = req.params.name;
            let pageNumber = 0;
            let pageSize = 5;
            data.findCampaignsByCategory(category, pageNumber, pageSize)
                .then((campaigns) =>
                    res.render('campaigns/all-campaigns', {
                        result: {
                            campaigns,
                            search: true
                        }
                    })
                );
        },
        donate(req, res) {
            let valueToDonate = +req.body.donationValue;
            let campaignId = req.params.id;
            data.fundCampaign(campaignId, valueToDonate)
                .then(() => {
                    res.status(201).redirect(`/campaigns/campaign/${campaignId}`);
                });
        },
        getPicture(req, res) {
            var gfs = grid(database.connection.db, database.mongo);
            var id = req.params.id;
            gfs.readFile({ _id: id }, (_, data) => {
                res.write(data);
                res.end();
            });
        },
        vote(req, res) {
            let campaignId = req.params.id;
            let userLikedCampaign = req.user.username;

            data.voteCampaign(campaignId, userLikedCampaign)
                .then(() => {
                    res.status(201).json({ vote: 'voted' });
                });
        },
        createComment(req, res) {
            let author = req.user.username;
            let authorAvatarId = req.user.avatar;
            let authorId = req.user._id;
            let content = req.body.commentContent;
            let campaignId = req.params.id;

            let comment = {
                authorId,
                campaignId,
                author,
                content,
                authorAvatarId
            };

            data.createComment(comment)
                .then(() => {
                    res.redirect(`/campaigns/campaign/${campaignId}`);
                });
        },
        search(req, res) {
            var pattern = req.query.q;
            data.searchByPattern(pattern)
                .then(campaigns => {
                    res.status(200).render('campaigns/all-campaigns', {
                        result: {
                            campaigns,
                            search: false
                        }
                    });
                });
        },
        reportContent(req, res) {
            let campaignId = req.params.id;

            let reporter = {
                username: req.user.username,
                userId: req.user.id
            };

            data.updateCampaignById(campaignId, {
                reporter,
                isReported: true
            })
                .then(() => {
                    res.status(201).json({
                        reported: true
                    });
                });
        },
        deleteCampaign(req, res) {
            let campaignId = req.params.id;
            data.deleteCampaignById(campaignId)
                .then(() => {
                    res.status(200).json({
                        redirect: '/home'
                    });
                });
        }
    };
};