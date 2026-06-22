export interface User {
  name: string
  surname: string
  username: string
  email: string
  password: string
  roles: any[]
  userInfo?: UserInfo
}

export interface UserInfo {
  phoneNumber?: string
  birthDate?: string
  gender?: string
  street?: string
}


export interface PasswordUpdate {
password?: string  
confirmPassword?: string
}
