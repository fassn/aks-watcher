import type { NextPage } from 'next'
import { GameForm } from '../components/gameForm'

const AddGame: NextPage = () => {
    return (
        <div className='flex justify-center items-center'>
            <div className='w-64'>
                <GameForm />
            </div>
        </div>
    )
}

export default AddGame
