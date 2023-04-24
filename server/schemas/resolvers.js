const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (h, _, context) => {
            if(context.user) {
                return User.findOne({_id: context.user._id}).populate("savedBooks")
            }
            throw new AuthenticationError("Log In First Before Attempting")
        }
    },

    Mutation: {
        createUser: async (_, {username, email, password}) => {
            const user = await User.create({ username, email, password })
            const token = signToken(user)
            if (!user) {
                throw new AuthenticationError('An Unknown Error Occured')
            }
            return {token, user}
        },

        saveBook: async (_, {input}, context) => {
            if (context.user) {
                const content = await User.findByIdAndUpdate(
                    context.user._id,
                    {$addToSet: { savedBooks: input}},
                    {new: true})
                    .populate("savedBooks")
                    return content
            }
            throw new AuthenticationError('Log In First Before Attempting')
        },

        deleteBook: async (_, {bookId}, context) => {
            if (context.user) {
                const content = await User.findByIdAndUpdate(
                    context.user._id,
                    {$pull: { savedBooks: bookId}},
                    {new: true})
                    return content
            }
            throw new AuthenticationError('Log In First Before Attempting')
        },

        login: async (_, {email, password })=> {
            const user = await User.findOne({email})
            if (!user) {
                throw new AuthenticationError('Enter Correct Email')
            }
            const pass = await user.isCorrectPassword(password)

        if (!pass) {
            throw new AuthenticationError('An Unknown Error Occured')
        }
        const token = signToken(user)
        return {token, user}
        }
    }
}

module.exports = resolvers
