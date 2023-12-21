import { Card } from 'flowbite-react';

async function getNotices() {
    const res = await fetch(`https://dev.dtverse.net/api/project/post?page=1&pageLength=10&whereOptions[]=%7B%22where_key%22:%22STATUS_CD%22,%22where_value%22:%22ALL%22,%22where_type%22:%22between%22%7D&orderOptions[]=%7B%22column_name%22:%22RECRUIT_START_DATE%22,%22orderOption%22:%22DESC%22%7D&member=%7B%22isLogin%22:false,%22memberId%22:null%7D`)
    return res.json()
}

export default async function Page() {
    const { statusCode, message, data } = await getNotices()
    return (
        <div>
            {data.map((notice: any) =>
                <Card href="#" className="max-w-sm" key={notice.id}>
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {notice.trialTitle}
                    </h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                        {notice.rewardInfo}
                    </p>
                </Card>
            )}
        </div>
    )
}
