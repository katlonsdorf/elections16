#!/usr/bin/env python

from time import sleep, time
from fabric.api import execute, task

import app_config
import sys
import traceback


def safe_execute(*args, **kwargs):
    """
    Wrap execute() so that all exceptions are caught and logged.
    """
    try:
        timestamp = time()
        execute(*args, **kwargs)
    except:
        ex_type, ex, tb = sys.exc_info()
        if app_config.DEBUG:
            print("ERROR [timestamp: {0}] - {1} | Traceback".format(timestamp, ex))
            traceback.print_tb(tb)
        else:
            print("ERROR [timestamp: {0}] - {1}".format(timestamp, ex))
        del tb


@task
def deploy(run_once=False):
    """
    Harvest data and deploy cards
    """
    count = 0

    while True:
        start = time()

        modulo = count % (app_config.CARD_DEPLOY_INTERVAL / app_config.RESULTS_DEPLOY_INTERVAL)

        print('results cycle hit')
        safe_execute('data.load_results')
        safe_execute('deploy_results_cards')
        card_end = time()
        print('results cycle finished in %ds' % (card_end - start))

        if modulo == 0:
            print('card cycle hit')
            safe_execute('deploy_all_cards')
            print('card cycle finished in %ds' % (time() - card_end))

        duration = time() - start
        wait = app_config.RESULTS_DEPLOY_INTERVAL - duration

        print('Deploying cards ran in %ds (cumulative)' % duration)

        if wait < 0:
            print('WARN: Deploying cards took %ds longer than %ds' % (abs(wait), app_config.RESULTS_DEPLOY_INTERVAL))
            wait = 0

        if run_once:
            print 'Run once specified, exiting.'
            sys.exit()
        else:
            sleep(wait)
