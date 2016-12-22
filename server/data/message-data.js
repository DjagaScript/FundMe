/*globals*/

module.exports = function (models) {
    let Message = models.Message;
    return {
        loadCurrentConversations(userId) {
            return new Promise((resolve, reject) => {
                Message.find({ $or: [{ 'firstUser.id': userId }, { 'secondUser.id': userId }] }, (err, messages) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(messages);
                });
            });
        },
        createConversation(args) {

            let message = new Message({
                firstUser: args.firstUser,
                secondUser: args.secondUser,
                identification: args.identification
            });

            return new Promise((resolve, reject) => {
                message.save((err) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(message);
                });
            });

        },
        findByIdentification(identification) {
            return new Promise((resolve, reject) => {
                Message.findOne({ 'identification': identification }, (err, message) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(message);
                });
            });
        },
        addMessage(identification, text, owner, date) {

            return new Promise((resolve,reject) => {
                this.findByIdentification(identification)
                    .then(message => {
                        message.texts.push({
                            text,
                            owner,
                            date
                        });

                        resolve(message.save());
                    });
            });
        }
    };
};