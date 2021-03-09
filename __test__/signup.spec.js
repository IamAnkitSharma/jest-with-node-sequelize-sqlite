const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const sequelize = require("../src/config/database");
beforeAll(() => {
  return sequelize.sync();
});
beforeEach(() => {
  return User.destroy({ truncate: true });
});
describe("User Registration", () => {
  const validUser = {
    username: "user1",
    email: "user1@gmail.com",
    password: "password",
  };
  const postUser = (user = validUser) =>
    request(app).post("/api/1.0/users").send(user);
  it("saves the user to DB", async (done) => {
    const res = await postUser();
    const list = await User.findAll();
    const savedUser = list[0];
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User Created");
    expect(savedUser.username).toBe("user1");
    expect(savedUser.email).toBe("user1@gmail.com");
    done();
  });

  it("hashes a password in DB", async (done) => {
    await postUser();
    const list = await User.findAll();
    const savedUser = list[0];
    expect(savedUser.password).not.toBe("password");
    done();
  });

  // it.each([["username", 400], ["email", 400], ["password", 400]])('when %s is null %s is received',async({field,expectedMessage})=>{
  //   const user = {
  //     username: 'user1',
  //     email: "user1@gmail.com",
  //     password: "password",
  //   }
  //   user[field] = null
  //   const res = await postUser(user);
  //   expect(res.status).toBe(400);
  // })
  it.each`
    field         | value             | expectedMessage
    ${"username"} | ${null}           | ${400}
    ${"username"} | ${"us"}           | ${400}
    ${"username"} | ${"s".repeat(33)} | ${400}
    ${"email"}    | ${"mail.com"}     | ${400}
    ${"email"}    | ${"mail"}         | ${400}
    ${"email"}    | ${null}           | ${400}
    ${"password"} | ${null}           | ${400}
    ${"password"} | ${"lol"}          | ${400}
  `(
    "returns $expectedMessage when $field is $value",
    async ({ field, expectedMessage, value }) => {
      const user = {
        username: "user1",
        email: "user1@gmail.com",
        password: "password",
      };
      user[field] = value;
      const res = await postUser(user);
      expect(res.status).toBe(400);
    }
  );

  it("returns email already exists if already in user", async (done) => {
    await User.create({ ...validUser });
    const response = await postUser();
    expect(response.status).toBe(400);
    done();
  });

  it("creates user in inactive mode", async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.inactive).toBe(true);
  });

  it("creates user in inactive mode even if inactive field is tampered or interceped", async () => {
    const newUser = { ...validUser, inactive: false };
    await postUser(newUser);
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.inactive).toBe(true);
  });

  it("creates an activation token for user", async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.activationToken).toBeTruthy();
  });
});
