import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { getCsrfToken } from "next-auth/react";

interface loginProps {
    csrfToken: string,
}

// export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
//     return {
//         props:{
//             csrfToken: await getCsrfToken(context)
//         },
//     }
// }

const Login = () => {
    return (
        <form method="post" action="/api/auth/callback/credentials">
            <input name="csrfToken" type="hidden" />
            <label>
                Username
                <input name="username" type="text" />
            </label>
            <label>
                Password
                <input name="password" type="password" />
            </label>
            <button type="submit">Sign in</button>
        </form>
    )
}

// const Login = ({ csrfToken }: loginProps) => {
//     return (
//         <form method="post" action="/api/auth/callback/credentials">
//             <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
//             <label>
//                 Username
//                 <input name="username" type="text" />
//             </label>
//             <label>
//                 Password
//                 <input name="password" type="password" />
//             </label>
//             <button type="submit">Sign in</button>
//         </form>
//     )
// }

export default Login;