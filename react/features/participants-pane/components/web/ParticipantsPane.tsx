import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';

import { IReduxState } from '../../../app/types';
import participantsPaneTheme from '../../../base/components/themes/participantsPaneTheme.json';
import { openDialog } from '../../../base/dialog/actions';
import { isMobileBrowser } from '../../../base/environment/utils';
import { IconCloseLarge, IconDotsHorizontal } from '../../../base/icons/svg';
import { isLocalParticipantModerator } from '../../../base/participants/functions';
import Button from '../../../base/ui/components/web/Button';
import ClickableIcon from '../../../base/ui/components/web/ClickableIcon';
import { BUTTON_TYPES } from '../../../base/ui/constants.web';
import { findAncestorByClass } from '../../../base/ui/functions.web';
import { isAddBreakoutRoomButtonVisible } from '../../../breakout-rooms/functions';
import { getKnockingParticipants, getLobbyEnabled } from '../../../lobby/functions';
import MuteEveryoneDialog from '../../../video-menu/components/web/MuteEveryoneDialog';
import {
    getVisitorsCount,
    getVisitorsInQueueCount,
    isVisitorsLive,
    shouldDisplayCurrentVisitorsList
} from '../../../visitors/functions';
import { close } from '../../actions.web';
import {
    getParticipantsPaneOpen,
    isMoreActionsVisible,
    isMuteAllVisible
} from '../../functions';
import { AddBreakoutRoomButton } from '../breakout-rooms/components/web/AddBreakoutRoomButton';
import { RoomList } from '../breakout-rooms/components/web/RoomList';

import CurrentVisitorsList from './CurrentVisitorsList';
import { FooterContextMenu } from './FooterContextMenu';
import LobbyParticipants from './LobbyParticipants';
import MeetingParticipants from './MeetingParticipants';
import VisitorsList from './VisitorsList';

/**
 * Interface representing the properties used for styles.
 *
 * @property {boolean} [isMobileBrowser] - Indicates whether the application is being accessed from a mobile browser.
 * @property {boolean} [isChatOpen] - Specifies whether the chat panel is currently open.
 */
interface IStylesProps {
    isChatOpen?: boolean;
}
const useStyles = makeStyles<IStylesProps>()((theme, { isChatOpen }) => {
    return {
        participantsPane: {
            backgroundColor: theme.palette.ui01,
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
            transition: 'width .16s ease-in-out',
            width: '315px',
            zIndex: isMobileBrowser() && isChatOpen ? -1 : 0,
            display: 'flex',
            flexDirection: 'column',
            fontWeight: 600,
            height: '100%',

            [[ '& > *:first-child', '& > *:last-child' ] as any]: {
                flexShrink: 0
            },

            '@media (max-width: 580px)': {
                height: '100dvh',
                position: 'fixed',
                left: 0,
                right: 0,
                top: 0,
                width: '100%'
            }
        },

        container: {
            boxSizing: 'border-box',
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            display: 'flex',
            flexDirection: 'column',

            '&::-webkit-scrollbar': {
                display: 'none'
            }
        },

        listSection: {
            overflowY: 'auto',
            overflowX: 'hidden'
        },

        listSectionGrow: {
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: '0 1 auto',
            minHeight: 0
        },

        closeButton: {
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center'
        },

        header: {
            alignItems: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            height: '60px',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            justifyContent: 'flex-end'
        },

        antiCollapse: {
            fontSize: 0,

            '&:first-child': {
                display: 'none'
            },

            '&:first-child + *': {
                marginTop: 0
            }
        },

        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: `${theme.spacing(4)} ${participantsPaneTheme.panePadding}px`,

            '& > *:not(:last-child)': {
                marginRight: theme.spacing(3)
            }
        },

        footerMoreContainer: {
            position: 'relative'
        }
    };
});

const ParticipantsPane = () => {
    const isChatOpen = useSelector((state: IReduxState) => state['features/chat'].isOpen);
    const { classes } = useStyles({ isChatOpen });
    const paneOpen = useSelector(getParticipantsPaneOpen);
    const isBreakoutRoomsSupported = useSelector((state: IReduxState) => state['features/base/conference'])
        .conference?.getBreakoutRooms()?.isSupported();
    const visitorsCount = useSelector(getVisitorsCount);
    const visitorsInQueueCount = useSelector(getVisitorsInQueueCount);
    const isLive = useSelector(isVisitorsLive);
    const showCurrentVisitorsList = useSelector(shouldDisplayCurrentVisitorsList);
    const lobbyEnabled = useSelector(getLobbyEnabled);
    const lobbyParticipants = useSelector(getKnockingParticipants);
    const showAddRoomButton = useSelector(isAddBreakoutRoomButtonVisible);
    const showFooter = useSelector(isLocalParticipantModerator);
    const showMuteAllButton = useSelector(isMuteAllVisible);
    const showMoreActionsButton = useSelector(isMoreActionsVisible);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [ contextOpen, setContextOpen ] = useState(false);
    const [ searchString, setSearchString ] = useState('');

    const onWindowClickListener = useCallback((e: any) => {
        if (contextOpen && !findAncestorByClass(e.target, classes.footerMoreContainer)) {
            setContextOpen(false);
        }
    }, [ contextOpen ]);

    useEffect(() => {
        window.addEventListener('click', onWindowClickListener);

        return () => {
            window.removeEventListener('click', onWindowClickListener);
        };
    }, []);

    const onClosePane = useCallback(() => {
        dispatch(close());
    }, []);

    const onDrawerClose = useCallback(() => {
        setContextOpen(false);
    }, []);

    const onMuteAll = useCallback(() => {
        dispatch(openDialog(MuteEveryoneDialog));
    }, []);

    const onToggleContext = useCallback(() => {
        setContextOpen(open => !open);
    }, []);

    const showVisitorsInQueue = visitorsInQueueCount > 0 && isLive === false;
    const showVisitorsList = visitorsCount > 0 || showVisitorsInQueue;
    const showLobby = lobbyEnabled && lobbyParticipants.length > 0;

    let listsCount = 1; // MeetingParticipants

    if (showVisitorsList) {
        listsCount++;
    }
    if (showLobby) {
        listsCount++;
    }
    if (isBreakoutRoomsSupported) {
        listsCount++;
    }
    if (showCurrentVisitorsList) {
        listsCount++;
    }

    const listClass = listsCount > 1 ? classes.listSectionGrow : classes.listSection;

    if (!paneOpen) {
        return null;
    }

    return (
        <div
            className = { classes.participantsPane }
            id = 'participants-pane'>
            <div className = { classes.header }>
                <ClickableIcon
                    accessibilityLabel = { t('participantsPane.close', 'Close') }
                    icon = { IconCloseLarge }
                    onClick = { onClosePane } />
            </div>
            <div className = { classes.container }>
                {showVisitorsList && (
                    <div className = { listClass }>
                        <VisitorsList />
                    </div>) }
                {showVisitorsList && <br className = { classes.antiCollapse } />}
                {showLobby && (
                    <div className = { listClass }>
                        <LobbyParticipants />
                    </div>) }
                {showLobby && <br className = { classes.antiCollapse } />}
                <div className = { listClass }>
                    <MeetingParticipants
                        searchString = { searchString }
                        setSearchString = { setSearchString } />
                </div>
                {isBreakoutRoomsSupported && (
                    <div className = { listClass }>
                        <RoomList searchString = { searchString } />
                    </div>) }
                {showAddRoomButton && <AddBreakoutRoomButton />}
                {showCurrentVisitorsList && (
                    <div className = { listClass }>
                        <CurrentVisitorsList searchString = { searchString } />
                    </div>) }
            </div>
            {showFooter && (
                <div className = { classes.footer }>
                    {showMuteAllButton && (
                        <Button
                            accessibilityLabel = { t('participantsPane.actions.muteAll') }
                            labelKey = { 'participantsPane.actions.muteAll' }
                            onClick = { onMuteAll }
                            type = { BUTTON_TYPES.SECONDARY } />
                    )}
                    {showMoreActionsButton && (
                        <div className = { classes.footerMoreContainer }>
                            <Button
                                accessibilityLabel = { t('participantsPane.actions.moreModerationActions') }
                                icon = { IconDotsHorizontal }
                                id = 'participants-pane-context-menu'
                                onClick = { onToggleContext }
                                type = { BUTTON_TYPES.SECONDARY } />
                            <FooterContextMenu
                                isOpen = { contextOpen }
                                onDrawerClose = { onDrawerClose }
                                onMouseLeave = { onToggleContext } />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export default ParticipantsPane;
