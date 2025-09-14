/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1789252180")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  // remove field
  collection.fields.removeById("relation1384045349")

  // remove field
  collection.fields.removeById("number4113142680")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1789252180")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_NFAILjXQS0` ON `subtasks` (`task`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2602490748",
    "hidden": false,
    "id": "relation1384045349",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "task",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number4113142680",
    "max": 999,
    "min": 1,
    "name": "order",
    "onlyInt": true,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
