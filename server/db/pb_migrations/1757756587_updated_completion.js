/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3328575470")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number570552902",
    "max": 1,
    "min": 0,
    "name": "progress",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3328575470")

  // remove field
  collection.fields.removeById("number570552902")

  return app.save(collection)
})
