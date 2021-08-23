import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'

import User from 'App/Models/User'
import UserAmount from 'App/Models/UserAmount'
import Status from 'App/Models/Status'
import UserAccount from './UserAccount'
export default class UserWithdrawal extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public bank: string

  @column()
  public amount: string

  @column()
  public completed: boolean

  @column()
  public status: number

  @column()
  public account_id: number

  @column()
  public receipt: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  @belongsTo(() => User, {
    foreignKey: 'user_id'
  })
  public user: BelongsTo<typeof User>

  @hasOne(() => UserAmount, {
    foreignKey: 'user_id'
  })
  public userAmount: HasOne<typeof UserAmount>

  @belongsTo(()=>Status, {
    foreignKey: 'status'
  })
  public status_name: BelongsTo<typeof Status>

  @belongsTo(()=> UserAccount, {
    foreignKey: 'account_id'
  })
  public account: BelongsTo<typeof UserAccount>

}