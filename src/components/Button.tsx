
import { Button, Tooltip } from 'flowbite-react';

interface IButton { piil?: boolean, color?: string, icon?: { direction: 'right' | 'left' | 'up' | 'down', Icon: any }, tooltip?: string }

export default function ButtonComponent({ piil = false, color, icon, tooltip }: IButton) {
    const Btn = () => <Button pill={piil} color={color}>
        {icon?.direction === 'left' && <icon.Icon/> }
        Default
        {icon?.direction === 'right' && <icon.Icon/> }
    </Button>
    if (tooltip)
        return (
            <Tooltip content={tooltip}>
                <Button pill={piil} color={color}>
                    Default
                </Button>
            </Tooltip>
        )
    return (
        <Btn />
    );
}
