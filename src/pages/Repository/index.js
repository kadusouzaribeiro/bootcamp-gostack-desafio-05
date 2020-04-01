import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  ContainerOptions,
  RadioGroup,
  PageActions,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    stateOption: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { stateOption } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: stateOption,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    const { match } = this.props;
    const { stateOption, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`repos/${repoName}/issues`, {
      params: {
        state: stateOption,
        per_page: 5,
        page,
      },
    });

    this.setState({
      issues: issues.data,
    });
  };

  handleOptionChange = async (e) => {
    await this.setState({
      stateOption: e.target.value,
      page: 1,
    });

    this.loadIssues();
  };

  handlePage = async (action) => {
    const { page } = this.state;
    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });
    this.loadIssues();
  };

  render() {
    const { repository, issues, loading, stateOption, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <ContainerOptions>
          <RadioGroup>
            <input
              type="radio"
              value="all"
              checked={stateOption === 'all'}
              onChange={(e) => {
                this.handleOptionChange(e);
              }}
            />
            <span>Todos</span>
            <input
              type="radio"
              value="open"
              checked={stateOption === 'open'}
              onChange={(e) => {
                this.handleOptionChange(e);
              }}
            />
            <span>Abertos</span>
            <input
              type="radio"
              value="closed"
              checked={stateOption === 'closed'}
              onChange={(e) => {
                this.handleOptionChange(e);
              }}
            />
            <span>Fechados</span>
          </RadioGroup>

          <PageActions>
            <button
              type="button"
              disabled={page < 2}
              onClick={() => this.handlePage('back')}
            >
              Anterior
            </button>
            <span>Página {page}</span>
            <button type="button" onClick={() => this.handlePage('next')}>
              Próximo
            </button>
          </PageActions>
        </ContainerOptions>

        <IssueList>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
