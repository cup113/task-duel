/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3328575470")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_M5HmurCAA3` ON `completion` (`user`)",
      "CREATE INDEX `idx_Oh0AXE5qTw` ON `completion` (`subtask`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1789252180",
    "hidden": false,
    "id": "relation2345380270",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "subtask",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation2375276105",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3328575470")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_M5HmurCAA3` ON `completion` (`user`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation2345380270")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation2375276105",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
