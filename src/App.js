import React, { Component } from 'react';
import './App.css';
import { AccountItem, CreateAccount } from 'ethereum-react-components'

class App extends Component {

  state = {
    geth: undefined,
    connected: false,
    error: '',
    accounts: []
  }

  componentDidMount = async () => {
    const geth = await window.grid.getClient('geth')
    console.log('geth', geth)
    if (geth) {
      this.setState({
        geth
      })
      console.log('geth state', geth.getState())
      geth.on('started', () => {
        console.log('geth started')
      })
      if (geth.getState() === 'CONNECTED') {
        this.setConnected()
      } else {
        geth.on('connected', this.setConnected)
      }
    } else {
      this.setState({
        error: 'client not found'
      })
    }
  }

  componentWillUnmount = () => {
    const { geth } = this.state
    if (!geth) return
    this.setState({
      geth: undefined
    })
    geth.off('connected', this.setState)
  }

  setConnected = () => {
    console.log('received connection event')
    this.setState({
      connected: true
    })
    this.loadAccounts()
  }

  loadAccounts = async () => {
    const { geth } = this.state
    // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_accounts
    try {
      const accounts = await geth.sendRpc('eth_accounts')
      if (accounts) {
        this.setState({
          accounts: accounts
        })
      }
    } catch (err) {
      this.setState({
        error: err.message
      })
    }
  }

  renderCreateAccount = () => {
    return <CreateAccount />
  }

  renderAccountList = accounts => {
    return (
      <div>
        {accounts.map((account, idx) => (
          <AccountItem name="Account 1" address={account} />
        ))}
      </div>
    )
  }

  render() {
    const { error, connected, accounts } = this.state
    return (
      <div className="App">
        <h1>My Wallet - connected to Grid {window.grid.version}</h1>
        <div>
          {connected
          ? !accounts && this.renderCreateAccount()
          : <div>Please start Geth and wait or <button onClick={() => window.location.reload()}>reload</button></div>
          }
        </div>
        <div>
          {accounts && this.renderAccountList(accounts)}
        </div>
        <div>
          {error && ('error:' + error)}
        </div>
      </div>
    );
  }
}

export default App
