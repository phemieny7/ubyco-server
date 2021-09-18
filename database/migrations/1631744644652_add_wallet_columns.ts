import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Coins extends BaseSchema {
  protected tableName = 'coins'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.string('wallet')
    })
  }
}
