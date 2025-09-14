/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1789252180")

  // remove field
  collection.fields.removeById("relation953563006")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1789252180")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3328575470",
    "hidden": false,
    "id": "relation953563006",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "completion",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
