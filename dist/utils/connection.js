"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeAbegConnection = exports.consumeConnection = exports.publishConnection = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// const amqpServer = "amqp://localhost:5672";
const amqpServer = "amqps://ytczyrcc:VVy6y7RE1kt3-FCMs_kV1621467bNh0t@whale.rmq.cloudamqp.com/ytczyrcc";
const publishConnection = (queue, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connect = yield amqplib_1.default.connect(amqpServer);
        const channel = yield connect.createChannel();
        yield channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    }
    catch (error) {
        console.log(error);
    }
});
exports.publishConnection = publishConnection;
const consumeConnection = (queue) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connect = yield amqplib_1.default.connect(amqpServer);
        const channel = yield connect.createChannel();
        yield channel.assertQueue(queue);
        yield channel.consume(queue, (message) => __awaiter(void 0, void 0, void 0, function* () {
            const myData = JSON.parse(message.content.toString());
            const account = yield prisma.crowdAuth.findUnique({
                where: { id: myData === null || myData === void 0 ? void 0 : myData.userID },
            });
            if ((account === null || account === void 0 ? void 0 : account.profile.length) === 0) {
                account === null || account === void 0 ? void 0 : account.profile.push(myData);
                const prof = yield prisma.crowdAuth.update({
                    where: { id: myData === null || myData === void 0 ? void 0 : myData.userID },
                    data: {
                        profile: account === null || account === void 0 ? void 0 : account.profile,
                    },
                });
            }
            else {
                let arr = account === null || account === void 0 ? void 0 : account.profile.filter((el) => {
                    return el.id !== myData.id;
                });
                account === null || account === void 0 ? void 0 : account.profile.push(myData);
                const prof = yield prisma.crowdAuth.update({
                    where: { id: myData === null || myData === void 0 ? void 0 : myData.userID },
                    data: {
                        profile: account === null || account === void 0 ? void 0 : account.profile,
                    },
                });
                console.log("resolved build: ", prof);
            }
            yield channel.ack(message);
        }));
    }
    catch (error) {
        console.log(error);
    }
});
exports.consumeConnection = consumeConnection;
const consumeAbegConnection = (queue) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connect = yield amqplib_1.default.connect(amqpServer);
        const channel = yield connect.createChannel();
        yield channel.assertQueue(queue);
        yield channel.consume(queue, (message) => __awaiter(void 0, void 0, void 0, function* () {
            const myData = JSON.parse(message.content.toString());
            const account = yield prisma.crowdAuth.findUnique({
                where: { id: myData === null || myData === void 0 ? void 0 : myData.userID },
            });
            account === null || account === void 0 ? void 0 : account.abeg.push(myData);
            yield prisma.crowdAuth.update({
                where: { id: myData === null || myData === void 0 ? void 0 : myData.userID },
                data: {
                    abeg: account === null || account === void 0 ? void 0 : account.abeg,
                },
            });
            yield channel.ack(message);
        }));
    }
    catch (error) {
        console.log(error);
    }
});
exports.consumeAbegConnection = consumeAbegConnection;
