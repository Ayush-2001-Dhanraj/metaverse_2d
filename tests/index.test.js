import axios from "axios";

const BACKEND_URL = "http://localhost:8900/";

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
