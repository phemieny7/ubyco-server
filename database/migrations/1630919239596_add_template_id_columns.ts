import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class NewlettersTemplates extends BaseSchema {
  protected tableName = 'newletters_templates'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer('template_id').references('newletters_templates.id')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.integer('template_id').references('newletters_templates.id')
    })
  }
}
