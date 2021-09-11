import React from 'react';
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';

// @material-ui/icons
// import FeedbackIcon from '@material-ui/icons/Feedback';

// core components
import GridItem from '../../components/Grid/GridItem';
import GridContainer from '../../components/Grid/GridContainer';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardIcon from '../../components/Card/CardIcon';
import CardBody from '../../components/Card/CardBody';
import CardFooter from '../../components/Card/CardFooter';

import RulesTable from '../../components/RulesTable/RulesTable';

import styles from '../../styles/jss/views/dashboardStyle';

const useStyles = makeStyles(styles);

export default function RulePage() {
  const classes = useStyles();
  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>
          <Card>
            <CardHeader color='rose'>
              <h4 className={classes.cardTitleWhite}>Queue Share</h4>
              <p className={classes.cardCategoryWhite}>0 - 1, in 0.25 steps</p>
            </CardHeader>
            <CardBody>
              <RulesTable />
            </CardBody>
            <CardFooter></CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
