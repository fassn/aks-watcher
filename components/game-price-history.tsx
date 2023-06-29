import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    ChartOptions,
    ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { GameWithPrices } from 'types/game-with-prices';
import { useState } from 'react';
import ReactModal from 'react-modal';
import moment from 'moment';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
);

export const GamePriceHistory = ({ game }: { game: GameWithPrices }) => {

    const gameWithLatestPrices = {
        ...game,
        prices:
            game.prices
            .filter((_, i) => {
                if ((i + 1) === game.prices.length) return true

                const dayIsBefore = moment(game.prices[i].date).isBefore(game.prices[i+1].date, 'day')
                const timeIsBefore = moment(game.prices[i].date).isBefore(game.prices[i+1].date, 'hour')
                if (dayIsBefore) return true
                // shouldn't happen if game' prices are sorted correctly upfront
                if (!dayIsBefore && !timeIsBefore) return true
            })
            .slice(-30)
    }

    const [modalShow, setModalShow] = useState(false)

    const showModal = () => {
        setModalShow(!modalShow)
    }

    const closeModal = () => {
        setModalShow(false)
    }

    const options: ChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Price history for ${game.name}`,
            },
        }
    };

    const labels = gameWithLatestPrices.prices.map(price => new Date(price.date).toLocaleDateString(process.env.NEXT_PUBLIC_LOCALE))
    const data: ChartData<"line", number[], string> = {
        labels,
        datasets: [
            {
                data: labels.map((_, i) => gameWithLatestPrices.prices[i].bestPrice),
                borderColor: 'rgb(40, 75, 99)',
                backgroundColor: 'rgb(229, 231, 235, 0.5)',
            }
        ],
    };

    return <>
        <button className="ml-2" title="Price evolution" onClick={showModal} data-cy="game_price_history_button">
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="18" height="18" viewBox="0 0 256 256" xmlSpace="preserve">
                <g stroke="none" strokeWidth="1" strokeDasharray="none" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" fill="#284b63" fillRule="nonzero" opacity="1" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
                    <rect x="6.14" y="2.02" rx="0" ry="0" width="8.09" height="85.95" stroke="none" strokeWidth="1" strokeDasharray="none" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" fill="#284b63" fillRule="nonzero" opacity="1" transform=" matrix(1 0 0 1 0 0) "/>
                    <rect x="0" y="73.74" rx="0" ry="0" width="90" height="8.09" stroke="none" strokeWidth="1" strokeDasharray="none" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" fill="#284b63" fillRule="nonzero" opacity="1" transform=" matrix(1 0 0 1 0 0) "/>
                    <polygon points="83.09,58.64 68.82,44.37 54.03,57.23 16.67,19.87 22.39,14.15 54.42,46.17 69.21,33.31 88.81,52.92 " stroke="none" strokeWidth="1" strokeDasharray="none" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" fill="#284b63" fillRule="nonzero" opacity="1" transform="  matrix(1 0 0 1 0 0) "/>
                    <polygon points="90,59.82 72.67,59.82 90,42.49 " stroke="none" strokeWidth="1" strokeDasharray="none" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" fill="rgb(0,0,0)" fillRule="nonzero" opacity="1" transform="  matrix(1 0 0 1 0 0) "/>
                </g>
            </svg>
        </button>
        <ReactModal
            id="game_price_history_modal"
            className='absolute w-auto top-1/3 left-1/2 -translate-x-1/2 p-4 overflow-auto bg-light-grey dark:bg-slate-300'
            overlayClassName='fixed inset-0 backdrop-blur-[5px]'
            isOpen={modalShow}
            onRequestClose={closeModal}
        >
            <Line  options={options} data={data} />
        </ReactModal>
    </>
}