"use strict";
var test = require("tape"); // assign the tape library to the variable "test"
var appRoot = require("app-root-path");
const {Anyroute, MatchResult} = require(appRoot + "/index.js");

var anyroute = new Anyroute;

function handler () {
	// console.log(arguments);
	return arguments[0];
}
function handler_post () {}


test("set default handler to placeholder", function (t) {
	var ret = anyroute.set("/collection/:cid/tab/:tabID", handler);
	// console.log(ret);
	t.true(ret instanceof Anyroute);
	t.false(ret.err);
	t.equal(ret.handler.name, "handler");
	t.deepEqual(ret.payload, {});
	t.end();
});

test("set default handler to placeholder, specifying method \"default\". Replacing previous.", function (t) {
	var ret = anyroute.set("/collection/:cid/tab/:tabID", handler, "default");
	t.true(ret instanceof Anyroute);
	t.false(ret.err);
	t.equal(ret.handler.name, "handler");
	t.deepEqual(ret.payload, {});
	t.end();
});

test("set default handler to placeholder, specifying method \"post\".", function (t) {
	var ret = anyroute.set("/collection/:cid/tab/:tabID/", handler_post, "post");
	t.true(ret instanceof Anyroute);
	t.false(ret.err);
	t.equal(ret.handler.name, "handler_post");
	t.deepEqual(ret.payload, {});
	t.end();
});

//~ console.log('--------------------');

test("get default handler and payload from a path.", function (t) {
	var ret = anyroute.get("/collection/123/tab/456");
	t.true(ret instanceof MatchResult);
	t.false(ret.err);
	t.equal(ret.handler.name, "handler");
	t.deepEqual(ret.payload, { cid: "123", tabID: "456" });
	t.end();
});

test("get default handler and payload from a extended path.", function (t) {
	var ret = anyroute.get("/collection/123/tab/456/aaaaa");
	t.true(ret instanceof MatchResult);
	t.equal(ret.err, "not found");
	t.true(ret.handler);
	t.equal(ret.handler.name, "handler");
	t.deepEqual(ret.payload, { cid: "123", tabID: "456" });
	t.end();
});

test("get default handler and payload from a path.", function (t) {
	var ret = anyroute.get("/collection/:cid/tab/:tabID", {}, "default");
	t.true(ret instanceof MatchResult);
	t.false(ret.err);
	t.equal(ret.handler.name, "handler");
	t.deepEqual(ret.payload, { cid: ":cid", tabID: ":tabID" });
	t.deepEqual(ret.payload, ret.run());
	ret.run((input) => console.log("callback in run(): " + JSON.stringify(input, null, 4)));
	t.end();
});

test("get post method handler and payload from a path.", function (t) {
	var ret = anyroute.get("/collection/CCC:ccc/tab/Tab:tabID", {user: "keroro"}, "post");
	t.true(ret instanceof MatchResult);
	t.false(ret.err);
	t.equal(ret.handler.name, "handler_post");
	t.deepEqual(ret.payload, { user: "keroro", cid: "CCC:ccc", tabID: "Tab:tabID" });
	t.end();
});

test("get all handlers and payload from a path.", function (t) {
	var ret = anyroute.get("/collection/foo/tab/bar", {cid: "admin"}, "all");
	t.true(ret instanceof MatchResult);
	t.false(ret.err);
	t.equal(ret.handler.default.name, "handler");
	t.equal(ret.handler.post.name, "handler_post");
	t.deepEqual(ret.payload, { cid: "foo", tabID: "bar" });
	t.end();
});

test("get head method handler and payload from a path. No matching feat so return error and default handler.", function (t) {
	var ret = anyroute.get("/collection/abc/tab/xyz", {}, "head");
	t.true(ret instanceof MatchResult);
	t.equal(ret.err, "not found");
	t.equal(ret.handler.name, "handler");
	t.deepEqual(ret.payload, { cid: "abc", tabID: "xyz" });
	// t.deepEqual(ret, ret.run());
	// ret.run((input) => console.log("callback in run(): " + JSON.stringify(input, null, 4)));
	t.end();
});

test("get handler and payload from a path. No match so return error.", function (t) {
	var ret = anyroute.get("/XXX/abc/PPP/xyz");
	t.true(ret instanceof MatchResult);
	t.equal(ret.err, "not found");
	t.false(ret.handler);
	t.deepEqual(ret.payload, {});
	// t.deepEqual(ret, ret.run());
	// ret.run((input) => console.log("callback in run(): " + JSON.stringify(input, null, 4)));
	t.end();
});

test("set then get and run", function (t) {
	var ret = anyroute.set("/foo/:foo/bar/:bar", handler).get('/foo/forty/bar/bobs').run({and: 'adam'});
	t.false(ret instanceof MatchResult);
	t.false(ret.err);
	// t.equal(ret.handler.name, "handler");
	t.deepEqual(ret, { foo: 'forty', bar: 'bobs', and: 'adam' });

	anyroute.notfound(function (matchResult) { return matchResult.payload.foo + matchResult.payload.and; });
	ret = anyroute.set("/f/:foo/b/:bar/bro", handler).get('/f/forty/b/bobs').run({foo: 'five', and: 'adams'});
	t.deepEqual(ret, 'fortyadams');
	
	t.end();
});

test("first layer not match", function (t) {
	var ret = anyroute.get('lalala').run({and: 'adam'});

	t.false(ret instanceof MatchResult);
	t.false(ret.err);
	t.equal(ret, 'undefinedadam');

	t.end();
});