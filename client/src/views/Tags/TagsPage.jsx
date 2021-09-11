import React from 'react';
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';

// @material-ui/icons
import FeedbackIcon from '@material-ui/icons/Feedback';

// core components
import GridItem from '../../components/Grid/GridItem';
import GridContainer from '../../components/Grid/GridContainer';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardIcon from '../../components/Card/CardIcon';
import CardBody from '../../components/Card/CardBody';
import CardFooter from '../../components/Card/CardFooter';

import styles from '../../styles/jss/views/dashboardStyle';

const useStyles = makeStyles(styles);

export default function TagsPage() {
  const classes = useStyles();
  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>
          <Card>
            <CardHeader color="info" icon>
              <CardIcon color="rose">
                <FeedbackIcon />
              </CardIcon>
            </CardHeader>
              <CardBody>Coming Soon!</CardBody>
            <CardFooter></CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
