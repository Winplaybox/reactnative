const graphql = require('graphql');
const mongoUtils = require('../utils/mongo_utils');
const ObjectId = require('mongodb').ObjectId;

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList, GraphQLInt } = graphql;


const ActType = new GraphQLObjectType({
    name: 'Act',
    fields: () => ({
        _id: { type: GraphQLString },
        name: { type: GraphQLString },
        desc: { type: GraphQLString },
        type: { type: GraphQLString },
        time: { type: GraphQLString },
        actors: { type: new GraphQLList(GraphQLString) },
        performers: {
            type: new GraphQLList(UserType),
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let items = await db.collection('users').find({ emp_id: { $in: parent.actors } });
                return items.toArray();
            }
        },
        ratings: {
            type: new GraphQLList(RatingType),
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let items = await db.collection('ratings').find({ act_id: new ObjectId(parent._id).toString() });
                return items.toArray();
            }
        },
        media: {
            type: new GraphQLList(MediaType),
            args: {
                limit: { type: GraphQLInt }
            },
            async resolve(parent, args) {
                let limit = args.limit || 0;
                let db = mongoUtils.getDb();
                let items = await db.collection('media').find({ post_id: new ObjectId(parent._id).toString() }).limit(limit);
                console.log(new ObjectId(parent._id).toString())
                return items.toArray();
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        doj: { type: GraphQLString },
        dob: { type: GraphQLString },
        gender: { type: GraphQLString },
        contact: { type: GraphQLString },
        emp_id: { type: GraphQLString },
        guid: { type: GraphQLString },
        email: { type: GraphQLString },
        avatar: { type: GraphQLString },
        userType: { type: GraphQLString },
        acts: {
            type: new GraphQLList(ActType),
            args: {
                limit: { type: GraphQLInt }
            },
            async resolve(parent, args) {
                let limit = args.limit || 0;
                let db = mongoUtils.getDb();
                let items = await db.collection('acts').find({ actors: parent.emp_id }).limit(limit);;
                return items.toArray();
            }
        },
        media: {
            type: new GraphQLList(MediaType),
            args: {
                limit: { type: GraphQLInt }
            },
            async resolve(parent, args) {
                let limit = args.limit || 0;
                let db = mongoUtils.getDb();
                let items = await db.collection('media').find({ user_id: parent.emp_id }).limit(limit);
                return items.toArray();
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let items = await db.collection('comments').find({ user_id: parent.emp_id });
                return items.toArray();
            }
        },
    })
});

const MediaType = new GraphQLObjectType({
    name: 'Media',
    fields: () => ({
        _id: { type: GraphQLString },
        user_id: { type: GraphQLString },
        post_id: { type: GraphQLString },
        post_type: { type: GraphQLString },
        media_type: { type: GraphQLString },
        name: { type: GraphQLString },
        meta: { type: GraphQLString },
        view_count: { type: GraphQLInt },
        time: { type: GraphQLString },
        author: {
            type: UserType,
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let items = await db.collection('users').findOne({ emp_id: parent.user_id });
                return items;
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let items = await db.collection('comments').find({ post_id: new ObjectId(parent._id).toString() });
                return items.toArray();
            }
        },
        comments_count: {
            type: GraphQLInt,
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let count = await db.collection('comments').find({ post_id: new ObjectId(parent._id).toString() }).count();
                return count;
            }
        },
        likes: {
            type: new GraphQLList(LikeType),
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let items = await db.collection('likes').find({ post_id: new ObjectId(parent._id).toString() });
                return items.toArray();
            }
        },
        likes_count: {
            type: GraphQLInt,
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let count = await db.collection('likes').find({ post_id: new ObjectId(parent._id).toString() }).count();
                return count;
            }
        }
    })
});

const LikeType = new GraphQLObjectType({
    name: 'Like',
    fields: () => ({
        _id: { type: GraphQLString },
        user_id: { type: GraphQLString },
        post_id: { type: GraphQLString },
        post_type: { type: GraphQLString },
        value: { type: GraphQLInt },
        time: { type: GraphQLString },
        user: {
            type: UserType,
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let item = await db.collection('users').findOne({ emp_id: parent.user_id });
                return item;
            }
        }
    })
});

const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: () => ({
        _id: { type: GraphQLString },
        user_id: { type: GraphQLString },
        post_id: { type: GraphQLString },
        post_type: { type: GraphQLString },
        comment: { type: GraphQLString },
        time: { type: GraphQLString },
        user: {
            type: UserType,
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let item = await db.collection('users').findOne({ emp_id: parent.user_id });
                return item;
            }
        }
    })
});

const RatingType = new GraphQLObjectType({
    name: 'Rating',
    fields: () => ({
        _id: { type: GraphQLString },
        user_id: { type: GraphQLString },
        act_id: { type: GraphQLString },
        rating: { type: GraphQLInt }
    })
});


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        acts: {
            type: new GraphQLList(ActType),
            args: {
                id: { type: GraphQLString },
                limit: { type: GraphQLInt },
                skip: { type: GraphQLInt }
            },
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let params = {};
                if (args.id != null) {
                    params = { ...params, _id: ObjectId(args.id) }
                }
                let skip = args.skip || 0;
                let limit = args.limit || 0;
                let items = await db.collection('acts').find(params).limit(limit).skip(skip);
                return items.toArray();
            }
        },
        users: {
            type: new GraphQLList(UserType),
            args: {
                id: { type: GraphQLString },
                limit: { type: GraphQLInt },
                skip: { type: GraphQLInt },
                orderby: { type: GraphQLString }
            },
            async resolve(parent, args) {
                let db = mongoUtils.getDb();

                let params = {};
                if (args.id != null) {
                    params = { ...params, emp_id: args.id }
                }

                let sortParams = { firstName: 1 };
                if (args.orderby != null) {
                    let o = args.orderby;
                    var field = "";
                    if (o.toLowerCase().indexOf('Desc') > -1) {
                        field = o.replace("Desc", "");
                        sortParams = { [field]: -1 }
                    } else {
                        field = o.replace("Asc", "");
                        sortParams = { [field]: 1 }
                    }
                }

                let skip = args.skip || 0;
                let limit = args.limit || 0;
                let items = await db.collection('users').find(params).limit(limit).skip(skip).sort(sortParams);
                return items.toArray();
            }
        },
        media: {
            type: new GraphQLList(MediaType),
            args: {
                id: { type: GraphQLString },
                user_id: { type: GraphQLString },
                limit: { type: GraphQLInt },
                skip: { type: GraphQLInt }
            },
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let params = {};
                if (args.id != null) {
                    params = { ...params, _id: ObjectId(args.id) }
                }
                if (args.user_id != null) {
                    params = { ...params, user_id: args.user_id }
                }
                let skip = args.skip || 0;
                let limit = args.limit || 0;

                if (args.id != null) db.collection('media').findOneAndUpdate(params, { $inc: { "view_count": 1 } });
                let items = await db.collection('media').find(params).limit(limit).skip(skip);
                return items.toArray();
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addAct: {
            type: ActType,
            args: {
                name: { type: GraphQLString },
                desc: { type: GraphQLString },
                type: { type: GraphQLString },
                time: { type: GraphQLString },
                actors: { type: new GraphQLList(GraphQLString) }
            },
            resolve(parent, args) {
                let db = mongoUtils.getDb();
                return new Promise((resolve, reject) => {
                    db.collection('acts').insertOne(args, (err, result) => {
                        resolve(result.ops[0])
                    })
                })
            }
        },
        updateAct: {
            type: ActType,
            args: {
                id: { type: GraphQLString },
                name: { type: GraphQLString },
                desc: { type: GraphQLString },
                type: { type: GraphQLString },
                time: { type: GraphQLString },
                actors: { type: new GraphQLList(GraphQLString) }
            },
            resolve(parent, args) {
                let updateData = { ...args };
                delete updateData.id;

                let db = mongoUtils.getDb();
                return new Promise((resolve, reject) => {
                    db.collection('acts').findOneAndUpdate({ _id: ObjectId(args.id) }, { $set: updateData }, (err, result) => {
                        console.log(result.value)
                        resolve(result.value)
                    })
                })
            }
        },
        addComment: {
            type: CommentType,
            args: {
                user_id: { type: GraphQLString },
                post_id: { type: GraphQLString },
                post_type: { type: GraphQLString },
                comment: { type: GraphQLString }
            },
            resolve(parent, args) {
                let db = mongoUtils.getDb();
                args.time = new Date().getTime();
                return new Promise((resolve, reject) => {
                    db.collection('comments').insertOne(args, (err, result) => {
                        resolve(result.ops[0])
                    })
                })
            }
        },
        addLike: {
            type: LikeType,
            args: {
                user_id: { type: GraphQLString },
                post_id: { type: GraphQLString },
                post_type: { type: GraphQLString },
                value: { type: GraphQLInt }
            },
            resolve(parent, args) {
                let db = mongoUtils.getDb();
                args.time = new Date().getTime();
                return new Promise((resolve, reject) => {
                    db.collection('likes').insertOne(args, (err, result) => {
                        if (err) {
                            console.log(err)
                        }
                        console.log("like added")
                        resolve(result.ops[0])
                    })
                })
            }
        },
        removeLike: {
            type: LikeType,
            args: {
                user_id: { type: GraphQLString },
                post_id: { type: GraphQLString }
            },
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let result = await db.collection('likes').deleteOne({ user_id: args.user_id, post_id: args.post_id })
                return result;
            }
        },
        addRating: {
            type: RatingType,
            args: {
                user_id: { type: GraphQLString },
                act_id: { type: GraphQLString },
                rating: { type: GraphQLInt }
            },
            resolve(parent, args) {
                let db = mongoUtils.getDb();
                return new Promise((resolve, reject) => {
                    db.collection('ratings').insertOne(args, (err, result) => {
                        if (err) { console.log(err) }
                        console.log("rating added")
                        resolve(result.ops[0])
                    })
                })
            }
        },
        deletePhoto: {
            type: MediaType,
            args: {
                id: { type: GraphQLString }
            },
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                args.time = new Date().getTime();
                let result = await db.collection('media').deleteOne({ _id: ObjectId(args.id) })
                return result;
            }
        },
        deleteAct: {
            type: ActType,
            args: {
                id: { type: GraphQLString }
            },
            async resolve(parent, args) {
                let db = mongoUtils.getDb();
                let result = await db.collection('acts').deleteOne({ _id: ObjectId(args.id) })
                return result;
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})