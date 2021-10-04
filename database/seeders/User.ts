import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'


export default class UserSeeder extends BaseSeeder {
  public async run () {
    await User.create({
      email: 'admin@ubycohub.com',
      password: 'power007$$',
      role_id : 2,
      is_verified: true,
      fullname: 'ubyco super admin',
    });
  }


  }
}
