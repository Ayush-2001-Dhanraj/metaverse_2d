import axios from "axios";

const BACKEND_URL = "http://localhost:8900/";
const WS_URL = "ws://localhost:8901/";

describe("Authentication", () => {
  test("user is able to sign up only once", async () => {
    const username = `Ayush_${Math.random()}`;
    const password = "12345678";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(response.statusCode).toBe(200);
    expect(response.data.userId).toBeDefined();

    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    expect(updatedResponse.statusCode).toBe(400);
  });

  test("Signup request fails if username is not provided", async () => {
    const password = "12345678";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
    });
    expect(response.statusCode).toBe(400);
  });

  test("Signin succeeds if username and password are correct", async () => {
    const username = `Ayush_${Math.random()}`;
    const password = "12345678";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test("Signin fails if username and password are incorrect", async () => {
    const username = `Ayush_${Math.random()}`;
    const password = "12345678";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "wrongUsername",
      password,
    });

    expect(response.statusCode).toBe(403); // unauthorized
  });
});

describe("User Metadata endpoint", () => {
  let token = "";
  let avatarID = "";

  beforeAll(async () => {
    const username = `Ayush_${Math.random()}`;
    const password = "12345678";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    token = response.body.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    avatarID = avatarResponse.data.avatarId;
  });

  test("User can't update there metadata with incorrect avatarID", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "12345643",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    expect(response.statusCode).toBe(400);
  });

  test("User can update there metadata with correct avatarID", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: avatarID,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    expect(response.statusCode).toBe(200);
  });

  test("User can't update there metadata if token not provided", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId: avatarID,
    });

    expect(response.statusCode).toBe(403);
  });
});

describe("User Avatar information", () => {
  let token = "";
  let avatarID = "";
  let userId = "";

  beforeAll(async () => {
    const username = `Ayush_${Math.random()}`;
    const password = "12345678";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    userId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    token = response.body.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    avatarID = avatarResponse.data.avatarId;
  });

  test("Get back avatar information of a user", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );

    expect(response.statusCode).toBe(200);
    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBeDefined();
  });

  test("Available avatar list should return the recently created avatar", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);

    expect(response.data.avatars.length).not.toBe(0);
    const currentAvatar = response.data.avatars.find((x) => x.id == avatarID);
    expect(response.data.currentAvatar).toBeDefined();
  });
});

describe("Space Information", () => {
  let element1Id = "";
  let element2Id = "";
  let mapId = "";
  let adminUserToken = "";
  let adminUserId = "";
  let userId = "";
  let userToken = "";

  beforeAll(async () => {
    const username = `Ayush_${Math.random()}`;
    const password = "12345678";

    const adminSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        type: "admin",
      }
    );

    adminUserId = adminSignupResponse.data.userId;

    const adminResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminUserToken = adminResponse.body.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "--user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "--user",
      password,
    });

    userToken = userResponse.body.token;

    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );
    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 2,
        height: 2,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    mapId = mapResponse.data.id;
  });

  test("User should be able to create a space with mapId", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(response.data.spaceId).toBeDefined();
  });

  test("User should be able to create a space without mapId", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(response.data.spaceId).toBeDefined();
  });

  test("User should not be able to create a space without mapId and dimensions", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(response.statusCode).toBe(400);
  });

  test("User should not be able to delete any random space", async () => {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/space/:someRandomSpaceId`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(response.statusCode).toBe(400);
  });

  test("User should be able to delete a space with spaceId", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/:${response.data.spaceId}`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    expect(deleteResponse.statusCode).toBe(200);
  });

  test("User should not be able to delete someone else's space with spaceId", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/:${response.data.spaceId}`,
      { headers: { Authorization: `Bearer ${adminUserToken}` } }
    );

    expect(deleteResponse.statusCode).toBe(400);
  });

  test("Admin has no space initially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: { Authorization: `Bearer ${adminUserToken}` },
    });

    expect(response.data.spaces.length).toBe(0);
  });

  test("Admin is able to get the space they recently created", async () => {
    const createSpaceResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      { headers: { Authorization: `Bearer ${adminUserToken}` } }
    );

    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: { Authorization: `Bearer ${adminUserToken}` },
    });
    expect(response.data.spaces.length).toBe(1);
    const currentSpace = response.data.spaces.find(
      (x) => x.id == createSpaceResponse.data.spaceId
    );
    expect(currentSpace).toBeDefined();
  });
});

describe("Arena Endpoints", () => {
  let element1Id = "";
  let element2Id = "";
  let mapId = "";
  let adminUserToken = "";
  let adminUserId = "";
  let userId = "";
  let userToken = "";
  let spaceId = "";

  beforeAll(async () => {
    const username = `Ayush_${Math.random()}`;
    const password = "12345678";

    const adminSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        type: "admin",
      }
    );

    adminUserId = adminSignupResponse.data.userId;

    const adminResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminUserToken = adminResponse.body.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "--user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "--user",
      password,
    });

    userToken = userResponse.body.token;

    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );
    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 2,
        height: 2,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    mapId = mapResponse.data.id;

    const spaceCreationResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    spaceId = spaceCreationResponse.data.spaceId;
  });

  test("Incorrect spaceId returns a 400", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/space/:someRandomSpaceId`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    expect(response.statusCode).toBe(400);
  });

  test("Correct spaceId returns all the elements", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/space/:${spaceId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    expect(response.data.dimensions).toBe("100x200");
    expect(response.data.elements.length).toBe(3);
  });

  test("Delete endpoint should be able to delete an element", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/space/:${spaceId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    await axios.delete(
      `${BACKEND_URL}/api/v1/space/element`,
      { id: response.data.elements[0].id },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    expect(response.data.elements.length).toBe(2);
  });

  test("Adding an element works as expected", async () => {
    const responseBeforeAdd = await axios.get(
      `${BACKEND_URL}/api/v1/space/:${spaceId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    const countBefore = responseBeforeAdd.data.elements.length;

    await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const response = await axios.get(
      `${BACKEND_URL}/api/v1/space/:${spaceId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    expect(response.data.elements.length).toBe(countBefore + 1);
  });

  test("Adding an element fails if element lies outside of dimensions", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 1000000,
        y: 2100,
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    expect(response.statusCode).toBe(400);
  });
});

describe("Admin Endpoints", () => {
  let adminUserToken = "";
  let adminUserId = "";
  let userId = "";
  let userToken = "";

  beforeAll(async () => {
    const username = `Ayush_${Math.random()}`;
    const password = "12345678";

    const adminSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        type: "admin",
      }
    );

    adminUserId = adminSignupResponse.data.userId;

    const adminResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminUserToken = adminResponse.body.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "--user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "--user",
      password,
    });

    userToken = userResponse.body.token;
  });

  test("User is not able to hit admin endpoints", async () => {
    const createElement = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const createAvatar = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const createMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [],
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const updateElement = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/:123`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    expect(createElement.statusCode).toBe(403);
    expect(createAvatar.statusCode).toBe(403);
    expect(createMap.statusCode).toBe(403);
    expect(updateElement.statusCode).toBe(403);
  });

  test("Admin is able to hit admin endpoints", async () => {
    const createElement = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    const createAvatar = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    const createMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [],
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    expect(createElement.statusCode).toBe(200);
    expect(createAvatar.statusCode).toBe(200);
    expect(createMap.statusCode).toBe(200);
  });

  test("Admin is able to update imageURL of an element", async () => {
    const elementResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );
    const updateElement = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/:${elementResponse.data.id}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    expect(updateElement.statusCode).toBe(200);
  });
});

describe("Websocket Tests", () => {
  let element1Id = "";
  let element2Id = "";
  let mapId = "";
  let adminUserToken = "";
  let adminUserId = "";
  let userId = "";
  let userToken = "";
  let spaceId = "";
  let ws1;
  let ws2;
  let ws1Messages = [];
  let ws2Messages = [];
  let userX;
  let userY;
  let adminX;
  let adminY;

  const waitForAndPopLatestMessage = (messageArray) => {
    return new Promise((r) => {
      if (messageArray.length) {
        resolve(messageArray.shift());
      } else {
        let interval = setInterval(() => {
          if (messageArray.length) {
            resolve(messageArray.shift());
            clearInterval(interval);
          }
        }, 100);
      }
    });
  };

  const setupHTTP = async () => {
    const username = `Ayush_${Math.random()}`;
    const password = "12345678";

    const adminSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        type: "admin",
      }
    );

    adminUserId = adminSignupResponse.data.userId;

    const adminResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminUserToken = adminResponse.body.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "--user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "--user",
      password,
    });

    userToken = userResponse.body.token;

    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );
    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 2,
        height: 2,
        static: true,
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${adminUserToken}` },
      }
    );

    mapId = mapResponse.data.id;

    const spaceCreationResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    spaceId = spaceCreationResponse.data.spaceId;
  };

  const setupWS = async () => {
    ws1 = new WebSocket(WS_URL);

    await new Promise((r) => {
      ws1.onopen = r;
    });

    ws2 = new WebSocket(WS_URL);

    await new Promise((r) => {
      ws2.onopen = r;
    });

    ws1.onmessage = (event) => {
      ws1Messages.push(JSON.parse(event.data));
    };

    ws2.onmessage = (event) => {
      ws2Messages.push(JSON.parse(event.data));
    };
  };

  beforeAll(async () => {
    setupHTTP();
    setupWS();
  });

  test("Get back acknowledgement for joining a space", async () => {
    ws1.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceID: spaceId,
          token: adminUserToken,
        },
      })
    );
    const message1 = await waitForAndPopLatestMessage(ws1Messages);

    ws2.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceID: spaceId,
          token: userToken,
        },
      })
    );

    const message2 = await waitForAndPopLatestMessage(ws2Messages);
    const message3 = await waitForAndPopLatestMessage(ws1Messages);

    expect(message1.type).toBe("space-joined");
    expect(message2.type).toBe("space-joined");
    expect(message1.payload.users.length).toBe(0);
    expect(message2.payload.users.length).toBe(1);
    expect(message3.type).toBe("user-join");
    expect(message3.payload.userId).toBe(userId);
    expect(message3.payload.x).toBe(message2.payload.spawn.x);
    expect(message3.payload.y).toBe(message2.payload.spawn.y);

    adminX = message1.payload.spawn.x;
    adminY = message1.payload.spawn.y;
    userX = message2.payload.spawn.x;
    userY = message2.payload.spawn.y;
  });

  test("User should not be able to move across the boundary of the wall", async () => {
    ws1.send(
      JSON.stringify({
        type: "movement",
        payload: {
          x: 1000000000,
          y: 20000000000000,
          userId: adminUserId,
        },
      })
    );

    const message = await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).toBe("movement-rejected");
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  });

  test("User should not be able to move two blocks at one time", async () => {
    ws1.send(
      JSON.stringify({
        type: "movement",
        payload: {
          x: adminX + 2,
          y: adminY,
          userId: adminUserId,
        },
      })
    );

    const message = await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).toBe("movement-rejected");
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  });

  test("Correct movement should be broadcasted to all sockets connected in the room", async () => {
    ws1.send(
      JSON.stringify({
        type: "movement",
        payload: {
          x: adminX + 1,
          y: adminY,
          userId: adminUserId,
        },
      })
    );

    const message = await waitForAndPopLatestMessage(ws2Messages);
    expect(message.type).toBe("movement");
    expect(message.payload.x).toBe(adminX + 1);
    expect(message.payload.y).toBe(adminY);
  });

  test("If a user leaves the other user receives a leave event", async () => {
    ws1.close();

    const message = await waitForAndPopLatestMessage(ws2Messages);
    expect(message.type).toBe("user-left");
    expect(message.payload.userId).toBe(adminUserId);
  });
});
