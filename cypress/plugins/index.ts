import makeEmailAccount from './email-account'

const emailAccount = async (on: any, config: any) => {
    const emailAccount = await makeEmailAccount()

    on('task', {
        getUserEmail() {
            return emailAccount.email
        },

        getLastEmail() {
            return emailAccount.getLastEmail()
        },
    })

    // important: return the changed config
    return config
}

export default emailAccount