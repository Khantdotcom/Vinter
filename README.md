# Software Requirements (V1.0)

- Low cost scheduler(cronjobs)


- repo webhooks
- database to store logs, webhooks
- Data dashboard
- add personal api token with admin:repo access in ui
- create webhooks if not avaliable
- display avaliable repos in graph and table

## Pain points

- At 42, feedbacks, your score is stored but not the commit log or your whole development process so you can't see your thought processes like a map
- in university, assignments are submitted but each week feels like a seperate items, after exams, you forget all and can't trace your learning history. 

## Main idea

- main idea is to keep track of learning / building logs
- in github, each commit has meaning but it's difficult to visualize the whole devlopment so let's track.

## Authentication Layer

- via oauth
- store in cookies and cache
- and api secret
- add returned **Authorization callback URL/ redirect urls**

## The answer is 42

- What if one user login with two devices at the same time
- What if login but never return callback url
- what if login fails