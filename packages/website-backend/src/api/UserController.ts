import { Controller, Get, Req, UseBefore } from '@tsed/common';
import GithubAgent from '../github/GithubAgent';
import * as contract from '@stryker-mutator/dashboard-contract';
import * as github from '../github/models';
import GithubRepositoryService from '../services/GithubRepositoryService';
import { GithubSecurityMiddleware } from '../middleware/securityMiddleware';

function toContract(githubLogin: github.Login): contract.Login {
  return {
    avatarUrl: githubLogin.avatar_url,
    name: githubLogin.login
  };
}

function allToContract(githubLogins: github.Login[]): contract.Login[] {
  return githubLogins.map(toContract);
}

@Controller('/user')
@UseBefore(GithubSecurityMiddleware)
export default class UserController {

  constructor(private readonly repoService: GithubRepositoryService) {
  }

  @Get('/')
  public async get(@Req() request: Express.Request): Promise<contract.Login> {
    return new GithubAgent(request.user.accessToken)
      .getCurrentUser()
      .then(toContract);
  }

  @Get('/repositories')
  public getRepositories(@Req() request: Express.Request): Promise<contract.Repository[]> {
    return this.repoService.getAllForUser(request.user);
  }

  @Get('/organizations')
  public getOrganizations(@Req() req: Express.Request): Promise<contract.Login[]> {
    const agent = new GithubAgent(req.user.accessToken);
    return agent.getMyOrganizations()
      .then(allToContract);
  }
}
